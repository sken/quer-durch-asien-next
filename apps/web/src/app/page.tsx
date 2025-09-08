'use client'

import ColorPicker from '@sken/color-picker/ColorPicker';
import {useState, useEffect} from "react";


export default function Home() {

    const [color, setColor] = useState('#ffffff');
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);

    // Function to convert hex to RGB
    const hexToRgb = (hex: string) => {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    };

    useEffect(() => {
        const fetchImages = async () => {
            const { r, g, b } = hexToRgb(color);
            const response = await fetch(`http://localhost:3000/images?r=${r}&g=${g}&b=${b}&page=${page}`);
            const data = await response.json();
            setImages(data);
        };


        fetchImages();
    }, [color, page]);


    return (
        <div
            className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">

            <div className="w-[900] h-[196] bg-cover bg-center bg-no-repeat" style={{ backgroundColor: '#' + color, backgroundImage: 'url(/background_colorselection.png)' }}>
                <div className="mt-5">
                    {color}
                    <ColorPicker onColorSelect={setColor}></ColorPicker>
                </div>
            </div>

            <div className="image-grid">
                {images.map((img: any) => (
                    <div key={img.id} className="image-item">
                        <img src={`https://quer-durch-asien.de/assets/images/final/${img.folder}/thumb2/${img.file}`} alt={img.title} width="100" height="100" />
                        <p>{img.title}</p>
                        <p>{img.country}, {img.day}</p>
                    </div>
                ))}
            </div>

            <div className="pagination">
                <button onClick={() => setPage(prev => Math.max(1, prev - 1))}>Previous</button>
                <span>Page {page}</span>
                <button onClick={() => setPage(prev => prev + 1)}>Next</button>
            </div>
        </div>
    );
}
