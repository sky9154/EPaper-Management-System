import {
  FC,
  useState,
  MouseEvent
} from 'react';
import CanvasClass from '../../functions/Canvas';



interface CanvasProps {
  canvas: CanvasClass;
  setCtx: (ctx: CanvasRenderingContext2D | null) => void;
}

const Canvas: FC<CanvasProps> = ({ canvas, setCtx }) => {
  const [drawing, setDrawing] = useState<boolean>(false);
  const [point, setPoint] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [lastPoint, setLastPoint] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  
  const [inputState, setInputState] = useState<boolean>(false);
  const [savedImage, setSavedImage] = useState<HTMLImageElement>(new Image());
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [imageArray, setImageArray] = useState<HTMLImageElement[]>([]);


  const handleCanvasRef = (canvasRef: HTMLCanvasElement | null) => {
    if (canvasRef) {
      const context = canvasRef.getContext('2d', { willReadFrequently: true });

      if (context) {
        if (!canvas.ctx) {
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = canvas.penColor;
        }

        setCtx(context);
      }
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawing && canvas.ctx) {
      canvas.setLastPoint({
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY
      }, setLastPoint);

      canvas.clearCanvas();
      canvas.restore(savedImage);

      switch (canvas.tool) {
        case 'pencil':
          canvas.draw();

          break;
        case 'eraser':
          canvas.clear();

          break;
        case 'line':
          canvas.drawLine();

          break;
        case 'rectangle':
          canvas.drawRectangle();

          break;
        case 'ellipse':
          canvas.drawOval();

          break;
      }

      canvas.ctx.stroke();
    }
  };

  const startDrawing = (event: MouseEvent<HTMLCanvasElement>) => {
    if (canvas.ctx) {
      canvas.ctx.lineCap = 'round';
      canvas.ctx.lineJoin = 'round';
      canvas.ctx.strokeStyle = canvas.penColor;
      canvas.ctx.lineWidth = canvas.penSize;

      const nowPoint = {
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY
      }

      canvas.setPoint(nowPoint, setPoint);

      if (canvas.tool === 'text' && !inputState) {
        setInputState(true);

        const input = document.createElement('input');

        input.style.position = 'fixed';
        input.style.fontSize = `${canvas.penSize}px`;
        input.style.width = `${canvas.penSize * 10}px`;
        input.style.maxWidth = '500px';
        input.style.left = `${event.clientX - 4}px`;
        input.style.top = `${event.clientY - 4}px`;
        input.style.zIndex = '100';

        input.onchange = () => {
          canvas.addText(input.value, nowPoint);

          document.body.removeChild(input);

          setInputState(false);
          pushImageArray();
        };

        document.body.appendChild(input);
        input.focus();
      } else if (canvas.tool === 'droplet') {
        // canvas.getColor(nowPoint, setPenColor);
      }

      canvas.ctx.beginPath();
      canvas.ctx.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);

      canvas.saveCanvas(setSavedImage);
      setDrawing(true);
    }
  };

  const endDrawing = () => {
    if (drawing) {
      console.log('工具', canvas.tool);
      console.log('起始', point);
      console.log('終點', lastPoint);
      
    }

    setDrawing(false);
  };

  if (imageArray.length === 0) {
    const context = canvas.ref.current;

    if (context) {
      const saved = new Image();
      saved.src = context.toDataURL('image/png');
      imageArray.push(saved);
      setImageArray(imageArray);
    }
  }

  const pushImageArray = () => {
    const context = canvas.ref.current;

    if (context) {
      const saved = new Image();
      saved.src = context.toDataURL('image/png');
      const newImageArray = imageArray.push(saved);
      setImageArray(imageArray);
      setImageIndex(newImageArray - 1);
    }
  }

  return (
    <canvas
      ref={(node) => {
        canvas.ref.current = node;
        handleCanvasRef(node);
      }}
      width={canvas.width}
      height={canvas.height}
      style={{
        border: '1px solid #cdcdcd',
        borderRadius: 2
      }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseOut={endDrawing}
      onMouseUpCapture={pushImageArray}
    />
  );
};

export default Canvas;