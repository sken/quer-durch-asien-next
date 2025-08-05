'use client'

import ColorPicker from '@sken/color-picker/ColorPicker';
import {useState} from "react";


export default function Home() {

    const [color, setColor] = useState('#ffffff');
    return (
        <div
            className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">

            <div className="w-[900] h-[196] bg-cover bg-center bg-no-repeat" style={{ backgroundColor: '#' + color, backgroundImage: 'url(/background_colorselection.png)' }}>
                <div className="mt-5">
                    {color}
                    <ColorPicker onColorSelect={setColor}></ColorPicker>
                </div>
            </div>
        </div>
    );
}
