# Solar System Simulation

An interactive 3D simulation of our solar system built with Three.js. This web-based application provides a scientifically accurate (though scaled) representation of the planets, their sizes, distances, and orbital characteristics.

![Solar System Simulation](https://cdn.britannica.com/93/95393-050-5329EE11/planets-distance-order-Sun.jpg)

## Features

- **Accurate Relative Scaling**: Planet sizes and distances are proportionally accurate (with scaling factors to make the simulation viewable)
- **Realistic Orbital Mechanics**: Includes elliptical orbits with proper eccentricity
- **Planetary Information**: Displays detailed data about each celestial body when selected
- **Interactive Controls**: Rotate, zoom, and focus on specific planets
- **Customizable Simulation**: Adjust rotation and orbital speeds
- **Scientifically Accurate Data**: Includes correct rotation periods, axial tilts, and orbital properties
- **Complete Solar System**: Includes the Sun, all planets, major moons, and even Pluto

## Usage

### Local Setup

1. Clone this repository
   ```
   git clone https://github.com/yourusername/solar-system-simulation.git
   ```

2. Navigate to the project directory
   ```
   cd solar-system-simulation
   ```

3. Open the `index.html` file in a web browser
   - You can use a local development server like [Live Server for VS Code](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
   - Or simply open the file directly in your browser

## Controls

- **Left Mouse Button + Drag**: Rotate the view
- **Mouse Wheel**: Zoom in/out
- **Click on a Planet**: Focus on that planet and display its information
- **GUI Controls**: 
  - Show/hide orbits
  - Adjust rotation and orbit speeds
  - Enable/disable planet following
  - Show/hide planet labels
  - Select a planet to focus on

## Technical Details

### Technologies Used

- **Three.js**: 3D rendering library
- **dat.GUI**: For the control interface
- **HTML/CSS/JavaScript**: Core web technologies

### Project Structure

- `index.html`: Main HTML document
- `css/style.css`: Stylesheet for the application
- `js/main.js`: JavaScript code containing the Three.js implementation and simulation logic

### Key Implementation Features

- Accurate orbital mechanics with proper eccentricity
- Realistic lighting with the sun as a light source
- Starfield background for immersion
- Dynamic labels that follow planets in the viewport
- Detailed information panel for selected celestial bodies
- Proper handling of axial tilts and rotations (including retrograde rotation)
- Special rendering for Saturn's and Uranus' rings

## Future Improvements

- Add asteroid belt visualization
- Implement textures for more realistic planet appearances
- Add more informational content about each celestial body
- Improve performance for lower-end devices
- Add a timeline feature to show planetary positions at different dates

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Planet data sourced from NASA
- Inspired by various planetary simulations and educational tools
- Built with the excellent Three.js library

---

Created with ❤️ by Danilo Vaccalluzzo