import {
  FC,
  useState,
  MouseEvent,
  ChangeEvent
} from 'react';
import {
  BiSolidCircle,
  BiRefresh,
  BiRotateLeft,
  BiRotateRight,
  BiDownload
} from 'react-icons/bi';
import { HexColorPicker } from 'react-colorful';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import CanvasClass from '../../functions/Canvas';


interface ToolsProps {
  canvas: CanvasClass;
}

const Tools: FC<ToolsProps> = ({ canvas }) => {
  const [colorPicker, setColorPicker] = useState<HTMLElement | null>(null);
  const [penSize, setPenSize] = useState<number>(10);
  const [penColor, setPenColor] = useState<string>('#000000');
  const [tool, setTool] = useState<string>('pointer');

  const toolSelected = (newTool: string) => {
    if (newTool !== canvas.tool) {
      canvas.setTool(newTool, setTool);
    }
  };

  const handlePenSize = (event: ChangeEvent<HTMLInputElement>) => {
    const size = Number(event.target.value);

    if (size > 0 && size <= 100) {
      canvas.setPenSize(size, setPenSize);
    }
  }

  const handlePenColor = (color: string) => {
    canvas.setPenColor(color, setPenColor);
  }

  return (
    <Box pt={1}>
      <IconButton
        size="large"
        aria-describedby="colorPicker"
        onClick={(event: MouseEvent<HTMLButtonElement>) => setColorPicker(event.currentTarget)}
        sx={{ color: canvas.penColor }}
      >
        <BiSolidCircle />
      </IconButton>
      <Popover
        id="colorPicker"
        open={Boolean(colorPicker)}
        anchorEl={colorPicker}
        onClose={() => setColorPicker(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box m={2}>
          <HexColorPicker color={penColor} onChange={handlePenColor} />
        </Box>
      </Popover>
      <OutlinedInput
        type="number"
        value={penSize}
        sx={{ width: 90 }}
        endAdornment={<InputAdornment position="end">px</InputAdornment>}
        onChange={handlePenSize}
      />
      {canvas.tools.map((item, index) => (
        <IconButton
          size="large"
          key={index}
          onClick={() => toolSelected(item.name)}
          disabled={tool === item.name}
        >
          {item.icon}
        </IconButton>
      ))}
      {/* <IconButton
        size="large"
        onClick={() => canvas.prevDraw(imageArray, imageIndex, setImageIndex)}
      >
        <BiRotateLeft />
      </IconButton>
      <IconButton
        size="large"
        onClick={() => canvas.nextDraw(imageArray, imageIndex, setImageIndex)}
      >
        <BiRotateRight />
      </IconButton>
      <IconButton
        size="large"
        onClick={() => canvas.initCanvas(setImageIndex, setImageArray)}
      >
        <BiRefresh />
      </IconButton> */}
      <IconButton
        size="large"
        onClick={() => canvas.download()}
      >
        <BiDownload />
      </IconButton>
    </Box>
  );
}

export default Tools;