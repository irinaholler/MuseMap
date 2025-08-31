import React from "react";
import MapView from "./components/MapView";
import AddMemoryModal from "./components/AddMemoryModal";
import "./styles/index.css";

export default function App() {
    return (
        <div>
            <MapView />
            <AddMemoryModal />
        </div>
    );
}
