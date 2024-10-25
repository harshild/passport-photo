import React, { useState, useRef } from 'react';
import {KeyValuePair} from "tailwindcss/types/config";

const PhotoCollage = () => {
    const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [customWidth, setCustomWidth] = useState<number | string>(''); // Allow empty input initially
    const [customHeight, setCustomHeight] = useState<number | string>(''); // Allow empty input initially
    const [horizontalSpace, setHorizontalSpace] = useState<number>(0);
    const [verticalSpace, setVerticalSpace] = useState<number>(0);
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF'); // Default white background
    const [paperSize, setPaperSize] = useState('4x6'); // Default page size
    // DPI conversion factor (300 DPI)
    const MM_TO_PX = 11.811;
    // Define page sizes in inches
    const pageSizes: KeyValuePair<string, {label:string , width: number, height: number}> = {
        A4: {label: "A4", width: 210, height: 297},  // mm
        Letter: {label: "Letter", width: 215.9, height: 279.4},  // mm
        Legal: {label: "Legal", width: 215.9, height: 355.6},  // mm
        "4x6": {label: "4 x 6", width: 101.6, height: 152.4},  // mm
        custom: {label: "Custom Size", width: 0, height: 0}  // Custom sizes will be set dynamically
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target?.result as string;
                img.onload = () => {
                    setUploadedImage(img); // Store the image in state
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const generateCollage = () => {
        const canvas = canvasRef.current;
        if (canvas && uploadedImage) {
            const ctx = canvas.getContext('2d');
            if (!ctx){
                console.error("Error initializing tool")
                throw "Error initializing tool"
            }
            const { width: paperWidth, height: paperHeight } = pageSizes[paperSize];

            // Fill canvas background color
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Convert image dimensions from physical units
            const imageWidthPX = 50.8 * MM_TO_PX;
            const imageHeightPX = 50.8 * MM_TO_PX;

            const paperWidthPX = paperWidth * MM_TO_PX;
            const paperHeightPX = paperHeight * MM_TO_PX;
            const horizontalSpacePX = horizontalSpace * MM_TO_PX;
            const verticalSpacePX = verticalSpace * MM_TO_PX;

            canvas.width = paperWidthPX;
            canvas.height = paperHeightPX;


            // Calculate how many images can fit on the canvas
            const cols = Math.floor((paperWidthPX + horizontalSpacePX) / (imageWidthPX + horizontalSpacePX));
            const rows = Math.floor((paperHeightPX + verticalSpacePX) / (imageHeightPX + verticalSpacePX));

            // Place images on the canvas
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = col * (imageWidthPX + horizontalSpacePX);
                    const y = row * (imageHeightPX + verticalSpacePX);
                    ctx.drawImage(uploadedImage, x, y, imageWidthPX, imageHeightPX);
                }
            }
        }
    };

    const downloadCollage = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'collage.jpeg';
            link.href = canvas.toDataURL('image/jpeg', 1.0);
            link.click();
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Passport Photo Utility</h1>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                aria-label="Upload Photo"
                className="mb-2"
                data-testid={"upload-photo"}
            />
            <div className="mb-4">
                <label className="mr-4">
                    Page Size:
                    <select
                        value={paperSize}
                        onChange={(e) => {
                            setPaperSize(e.target.value);
                            if (e.target.value !== 'custom') {
                                setCustomWidth('');
                                setCustomHeight('');
                            }
                        }}
                        className="ml-2 border rounded"
                    >
                        {Object.keys(pageSizes).map((size=> {
                            return <option key={size} value={size}>{pageSizes[size].label}</option>
                        }))}
                    </select>
                </label>
                {paperSize === 'custom' && (
                    <>
                        <label>
                            Custom Width (inches):
                            <input
                                type="number"
                                value={customWidth}
                                onChange={(e) => setCustomWidth(e.target.value)}
                                className="ml-2 border rounded"
                            />
                        </label>
                        <label className="ml-4">
                            Custom Height (inches):
                            <input
                                type="number"
                                value={customHeight}
                                onChange={(e) => setCustomHeight(e.target.value)}
                                className="ml-2 border rounded"
                            />
                        </label>
                    </>
                )}
                <label className="ml-4">
                    Horizontal Space (inches):
                    <input
                        type="number"
                        value={horizontalSpace}
                        onChange={(e) => setHorizontalSpace(Number(e.target.value))}
                        className="ml-2 border rounded"
                    />
                </label>
                <label className="ml-4">
                    Vertical Space (inches):
                    <input
                        type="number"
                        value={verticalSpace}
                        onChange={(e) => setVerticalSpace(Number(e.target.value))}
                        className="ml-2 border rounded"
                    />
                </label>
                <label className="ml-4">
                    Background Color:
                    <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="ml-2 border rounded"
                    />
                </label>
            </div>
            {uploadedImage && (
                <div>
                    <h2 className="text-xl mb-2">Image Preview:</h2>
                    <canvas
                        ref={canvasRef}
                        width="500"
                        height="500"
                        aria-label="Collage Canvas"
                        className="border"
                    ></canvas>
                    <div className="mt-2">
                        <button data-testid={"generate-collage"} onClick={generateCollage} className="bg-blue-500 text-white p-2 rounded">Generate Collage</button>
                        <button onClick={downloadCollage} className="bg-green-500 text-white p-2 ml-2 rounded">Download Collage</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoCollage;
