// Assuming you have a method to get building properties and their numbers
import { getSpriteMaterial } from './ViewHelper.js'; // Adjust the path if necessary

function createBuildingLabel(buildingNumber, position) {
    const color = new THREE.Color(0xffffff); // Set your desired color
    const spriteMaterial = getSpriteMaterial(color, buildingNumber);
    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Set the position of the sprite to the building's position
    sprite.position.set(position.x, position.y, position.z); // Adjust based on your scene

    scene.add(sprite); // Add the sprite to your scene
}

// Example of creating labels for each building
const buildings = [
    { number: 'B1', position: { x: 0, y: 0, z: 0 } },
    { number: 'B2', position: { x: 1, y: 1, z: 0 } },
    // Add more buildings as needed
];

buildings.forEach(building => {
    createBuildingLabel(building.number, building.position);
});
