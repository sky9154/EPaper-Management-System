import { FC, useState, useRef } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import CanvasClass from '../functions/Canvas';
import Main from '../components/Canvas/Main';
import Tools from '../components/Canvas/Tools';


const Canvas: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);


  const canvas = new CanvasClass(canvasRef, ctx);
  canvas.setCanvasSize(800, 480);

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
    >

      <Paper elevation={3} style={{ padding: '16px' }}>
        <Main canvas={canvas} setCtx={setCtx} />
        <Tools canvas={canvas} />
      </Paper>
    </Stack>

  );
}

export default Canvas;