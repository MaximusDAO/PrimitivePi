document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');
    const simulation = new BuffonSimulation(canvasContainer);
    
    // Set up event listeners
    document.getElementById('drop-one').addEventListener('click', () => {
        simulation.dropNeedle();
    });
    
    document.getElementById('drop-ten').addEventListener('click', () => {
        simulation.dropMultipleNeedles(10);
    });
    
    document.getElementById('drop-hundred').addEventListener('click', () => {
        simulation.dropMultipleNeedles(100);
    });
    
    document.getElementById('drop-thousand').addEventListener('click', () => {
        simulation.dropMultipleNeedles(1000);
    });
    
    document.getElementById('drop-tenthousand').addEventListener('click', () => {
        simulation.dropMultipleNeedles(10000);
    });
    
    document.getElementById('drop-hundredthousand').addEventListener('click', () => {
        simulation.dropMultipleNeedles(100000);
    });
    
    document.getElementById('reset').addEventListener('click', () => {
        simulation.reset();
    });
    
    document.getElementById('speed-slider').addEventListener('input', (e) => {
        simulation.setAnimationSpeed(parseInt(e.target.value));
    });
}); 