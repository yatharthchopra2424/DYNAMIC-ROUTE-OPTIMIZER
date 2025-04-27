# 🚀 DYNAMIC-ROUTE-OPTIMIZER 🛣️

A sophisticated route optimization tool designed to determine the best travel routes by evaluating factors such as distance, time, emissions, weather conditions, and air quality. Ideal for environmentally conscious travelers and logistics professionals!

## ✨ Features

- **Multiple Destinations**: Plan routes with multiple endpoints for comprehensive trips.
- **Vehicle Options**: Select from various vehicle types: car, truck, van, bike, flying, and public transport.
- **Package Weight Consideration**: Incorporate package weight for precise emissions calculations.
- **Real-Time Integration**: Leverages Google Maps, OpenWeatherMap, and AQICN APIs for current data.
- **Interactive Mapping**: Displays routes with markers and detailed info windows.
- **Route Comparison**: Offers the optimal route alongside alternative options.
- **Secure Access**: Features Google-based user authentication.

## 🛠️ Installation

### Prerequisites

- Python 3.x
- Node.js and npm
- API Keys: Google Maps, OpenWeatherMap, AQICN, RapidAPI
- Firebase Project for Authentication

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Set up and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure API keys in a `.env` file:
   ```env
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   AQICN_API_KEY=your_aqicn_api_key
   OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
   RAPIDAPI_KEY=your_rapidapi_key
   ```

5. Launch the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Move to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase and Google Maps API keys in a `.env` file:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   VITE_FIREBASE_GOOGLE_CLIENT_ID=your_firebase_google_client_id
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📖 Usage

1. **Sign In**: Log in using your Google account.
2. **Enter Locations**: Input your starting point and destination(s).
3. **Choose Vehicle**: Select your vehicle type from the available options.
4. **Specify Weight**: Add the package weight if applicable.
5. **Optimize**: Hit the "Optimize Route" button to compute the best route.
6. **Review**: Explore the optimal route and alternatives, including metrics like distance, duration, emissions, weather, and air quality.

## 🔑 API Keys

Obtain and configure the following API keys in the respective `.env` files:

- Google Maps API Key
- OpenWeatherMap API Key
- AQICN API Key
- RapidAPI Key (for CO2 emissions)
- Firebase Configuration for Authentication

## 🔄 Flowchart

```mermaid
graph TD
    A[User Input] --> B[Backend API]
    B --> C[Google Maps API]
    B --> D[OpenWeatherMap API]
    B --> E[AQICN API]
    B --> F[RapidAPI for Emissions]
    C --> G[Route Data]
    D --> H[Weather Data]
    E --> I[Air Quality Data]
    F --> J[Emissions Data]
    G --> K[Process and Compare Routes]
    H --> K
    I --> K
    J --> K
    K --> L[Frontend Display]
```

## 🎥 Video Demo

Check out the demo video to see the application in action:

[Watch the Video](https://github.com/yourusername/DYNAMIC-ROUTE-OPTIMIZER/blob/main/demo.mp4)

**Note**: Replace `yourusername` with your actual GitHub username and ensure `demo.mp4` is uploaded to your repository.

## 🤝 Contributing

We welcome contributions! Please fork the repository and submit a pull request with your enhancements.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.