class BuffonSimulation {
    constructor(container) {
        this.container = container;
        this.needles = [];
        this.totalNeedles = 0;
        this.crossingNeedles = 0;
        this.animationSpeed = 50;
        this.needleQueue = [];
        this.animating = false;
        
        // Constants
        this.NEEDLE_LENGTH = 1;
        this.LINE_SPACING = 2 * this.NEEDLE_LENGTH; // 2L as specified
        this.NEEDLE_COLOR = 0x8B4513; // Brown for sticks
        this.CROSSING_NEEDLE_COLOR = 0x4CAF50; // Green for crossing sticks
        
        this.init();
    }
    
    init() {
        // Set up Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa1887f); // Dirt color background
        
        // Set up camera
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.OrthographicCamera(
            -width / 200, width / 200, 
            height / 200, -height / 200, 
            0.1, 1000
        );
        this.camera.position.z = 5;
        
        // Set up renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Create the parallel lines
        this.createLines();
        
        // Start animation loop
        this.animate();
    }
    
    createLines() {
        // Calculate how many lines we need based on the camera view
        const cameraWidth = this.camera.right - this.camera.left;
        const cameraHeight = this.camera.top - this.camera.bottom;
        
        // Add some padding
        const paddingX = cameraWidth * 0.1;
        const paddingY = cameraHeight * 0.1;
        
        // Calculate the board dimensions
        this.boardWidth = cameraWidth - 2 * paddingX;
        this.boardHeight = cameraHeight - 2 * paddingY;
        
        // Create a board background (dirt texture)
        const boardGeometry = new THREE.PlaneGeometry(this.boardWidth, this.boardHeight);
        const boardMaterial = new THREE.MeshBasicMaterial({ color: 0xa1887f }); // Dirt color
        this.board = new THREE.Mesh(boardGeometry, boardMaterial);
        this.scene.add(this.board);
        
        // Calculate number of lines
        const numLines = Math.floor(this.boardHeight / this.LINE_SPACING) + 1;
        
        // Create lines
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x5D4037, linewidth: 3 }); // Darker brown for lines
        
        this.lines = [];
        this.linePositions = [];
        
        // Start position for the first line (centered)
        const startY = -this.boardHeight / 2 + (this.boardHeight - (numLines - 1) * this.LINE_SPACING) / 2;
        
        for (let i = 0; i < numLines; i++) {
            const y = startY + i * this.LINE_SPACING;
            this.linePositions.push(y);
            
            const points = [
                new THREE.Vector3(-this.boardWidth / 2, y, 0),
                new THREE.Vector3(this.boardWidth / 2, y, 0)
            ];
            
            lineGeometry.setFromPoints(points);
            const line = new THREE.Line(lineGeometry.clone(), lineMaterial);
            this.scene.add(line);
            this.lines.push(line);
        }
    }
    
    dropNeedle() {
        // Random position within the board
        const x = (Math.random() - 0.5) * this.boardWidth;
        const y = (Math.random() - 0.5) * this.boardHeight;
        
        // Random angle
        const angle = Math.random() * Math.PI;
        
        // Create needle geometry with slight variation for a more natural stick look
        const needleGeometry = new THREE.BufferGeometry();
        const halfLength = this.NEEDLE_LENGTH / 2;
        
        // Add slight curve/variation to make it look more like a real stick
        const x1 = x - halfLength * Math.cos(angle);
        const y1 = y - halfLength * Math.sin(angle);
        const x2 = x + halfLength * Math.cos(angle);
        const y2 = y + halfLength * Math.sin(angle);
        
        // Add a slight bend in the middle for a more natural stick appearance
        const bendAmount = Math.random() * 0.05;
        const midX = (x1 + x2) / 2 + bendAmount * Math.sin(angle);
        const midY = (y1 + y2) / 2 - bendAmount * Math.cos(angle);
        
        const points = [
            new THREE.Vector3(x1, y1, 0.1),
            new THREE.Vector3(midX, midY, 0.1),
            new THREE.Vector3(x2, y2, 0.1)
        ];
        
        needleGeometry.setFromPoints(points);
        
        // Check if the needle crosses any line
        let crossing = false;
        for (const lineY of this.linePositions) {
            // If the needle crosses a line, the endpoints must be on opposite sides of the line
            if ((y1 - lineY) * (y2 - lineY) <= 0) {
                crossing = true;
                break;
            }
        }
        
        // Create needle with appropriate color and thickness
        const needleMaterial = new THREE.LineBasicMaterial({ 
            color: crossing ? this.CROSSING_NEEDLE_COLOR : this.NEEDLE_COLOR,
            linewidth: 2 + Math.random() * 2 // Varying thickness for more natural look
        });
        
        const needle = new THREE.Line(needleGeometry, needleMaterial);
        
        // Add to queue for animation
        this.needleQueue.push({
            needle,
            crossing
        });
        
        // If not currently animating, start
        if (!this.animating) {
            this.processNeedleQueue();
        }
    }
    
    processNeedleQueue() {
        if (this.needleQueue.length === 0) {
            this.animating = false;
            return;
        }
        
        this.animating = true;
        const { needle, crossing } = this.needleQueue.shift();
        
        // Add needle to scene
        this.scene.add(needle);
        this.needles.push(needle);
        
        // Update counts
        this.totalNeedles++;
        if (crossing) {
            this.crossingNeedles++;
        }
        
        // Update UI
        this.updateStats();
        
        // Process next needle after delay based on animation speed
        const delay = Math.max(10, 500 - this.animationSpeed * 5);
        setTimeout(() => this.processNeedleQueue(), delay);
    }
    
    dropMultipleNeedles(count) {
        for (let i = 0; i < count; i++) {
            this.dropNeedle();
        }
    }
    
    reset() {
        // Remove all needles from scene
        for (const needle of this.needles) {
            this.scene.remove(needle);
        }
        
        // Clear arrays and reset counts
        this.needles = [];
        this.needleQueue = [];
        this.totalNeedles = 0;
        this.crossingNeedles = 0;
        this.animating = false;
        
        // Update UI
        this.updateStats();
    }
    
    updateStats() {
        document.getElementById('total-count').textContent = this.totalNeedles;
        document.getElementById('crossing-count').textContent = this.crossingNeedles;
        
        if (this.totalNeedles > 0 && this.crossingNeedles > 0) {
            const piApprox = (this.totalNeedles / this.crossingNeedles).toFixed(6);
            document.getElementById('pi-approximation').textContent = piApprox;
            
            const error = Math.abs((piApprox - Math.PI) / Math.PI * 100).toFixed(2);
            document.getElementById('error').textContent = error;
        } else {
            document.getElementById('pi-approximation').textContent = '-';
            document.getElementById('error').textContent = '-';
        }
    }
    
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.left = -width / 200;
        this.camera.right = width / 200;
        this.camera.top = height / 200;
        this.camera.bottom = -height / 200;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
} 