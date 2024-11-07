import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import PhotoCollage from './PhotoCollage';




test('allows users to upload an image', async () => {
    render(<PhotoCollage />);
    const a = await fetch("./public/logo192.png")
    const file = new File([await a.blob()], 'example.png', { type: 'image/png' });
    const fileInput = await screen.findByTestId('upload-photo');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(()=> expect(screen.findByTestId("generate-collage")).toBeInTheDocument())
    // const canvasElement = await screen.findByTestId("generate-collage");
    // expect(canvasElement).toBeInTheDocument();
});

test('allows users to set custom sizes and spaces', async () => {
    render(<PhotoCollage />);

    const widthInput = screen.getByLabelText(/custom width/i);
    const heightInput = screen.getByLabelText(/custom height/i);
    const horizontalSpaceInput = screen.getByLabelText(/horizontal space/i);
    const verticalSpaceInput = screen.getByLabelText(/vertical space/i);

    fireEvent.change(widthInput, { target: { value: '300' } });
    fireEvent.change(heightInput, { target: { value: '200' } });
    fireEvent.change(horizontalSpaceInput, { target: { value: '10' } });
    fireEvent.change(verticalSpaceInput, { target: { value: '10' } });

    expect(widthInput).toHaveValue(300);
    expect(heightInput).toHaveValue(200);
    expect(horizontalSpaceInput).toHaveValue(10);
    expect(verticalSpaceInput).toHaveValue(10);
});
