from PIL import Image, ImageDraw, ImageFont
import numpy as np
import cv2


class ePaper ():
  def __init__ (self, image_path):
    self.image = cv2.imread(image_path)
    self.image_path = image_path
    self.bmp = None
    self.bmp_path = None


  def put_text (self, text, position, font_color=(0, 0, 0), font_size=30):
    '''
    寫入文字
    '''

    image = self.image

    if (isinstance(image, np.ndarray)):
      image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

    draw = ImageDraw.Draw(image)

    fontStyle = ImageFont.truetype('fonts/NotoSansTC-Medium.ttf', font_size, encoding='utf-8')

    draw.text(position, text, font_color, font=fontStyle)

    self.image = cv2.cvtColor(np.asarray(image), cv2.COLOR_RGB2BGR)


  def resize (self, dsize):
    '''
    調整圖像大小
    '''

    self.image = cv2.resize(self.image, dsize)


  def process (self):
    '''
    正規化圖像尺寸
    '''

    frame = self.image

    height, width = frame.shape[:2]
    aspect_ratio = width / height

    new_width = int(height * 5 / 3)
    new_aspect_ratio = 5 / 3

    if abs(aspect_ratio - new_aspect_ratio) > 0.001:
      pad = int((new_width - width) / 2)

      image = np.full((height, new_width, 3), (255, 255, 255), np.uint8)
      image[:, pad : pad + width] = frame
    else:
      image = frame

    resized = cv2.resize(image, (800, 480), interpolation = cv2.INTER_AREA)

    self.image = resized


  def to7color (self, bmp_image):
    '''
    圖像轉成 7 色圖像
    '''

    image = Image.open(self.image_path)

    for x in range(image.width):
      for y in range(image.height):
        pixel = image.getpixel((x, y))

        if pixel[1] > pixel[0] and pixel[1] > pixel[2]:
          r = pixel[0] + ((pixel[1] - pixel[0]) >> 1)
          g = pixel[1]
          b = pixel[2] + ((pixel[1] - pixel[2]) >> 1)
          image.putpixel((x, y), (r, g, b))

    expanded = Image.new(image.mode, (image.width, image.height))
    expanded.paste(image)

    palette_data = [
      0x00, 0x00, 0x00,
      0xff, 0xff, 0xff,
      0x00, 0xff, 0x00,
      0x00, 0x00, 0xff,
      0xff, 0x00, 0x00,
      0xff, 0xff, 0x00,
      0xff, 0x80, 0x00
    ]

    palette_data += [0] * ((256 - 7) * 3)

    palimage = Image.new('P', (image.width, image.height))
    palimage.putpalette(palette_data)

    expanded.load()
    palimage.load()

    if palimage.mode != 'P':
      raise ValueError('bad mode for palette image')
    if expanded.mode != 'RGB' and expanded.mode != 'L':
      raise ValueError('only RGB or L mode images can be quantized to a palette')

    image = expanded.im.convert('P', 1, palimage.im)

    try:
      new_image =  expanded._new(image)
    except AttributeError:
      new_image =  expanded._makeself(image)

    new_image.save(bmp_image)
    self.bmp_path = bmp_image
    self.bmp = cv2.imread(bmp_image)


  def toText (self):
    '''
    轉成文字
    '''

    palette_data = {
      '[0, 0, 0]': 0,
      '[255, 255, 255]': 1,
      '[0, 255, 0]': 2,
      '[0, 0, 255]': 3,
      '[255, 0, 0]': 4,
      '[255, 255, 0]': 5,
      '[255, 128, 0]': 6
    }

    image = cv2.cvtColor(self.bmp, cv2.COLOR_BGR2RGB)

    color7 = []

    for column in range(len(image)):
      for row in range(len(image[column])):
        color7.append(image[column][row].tolist())

    return ''.join([str(palette_data.get(str(color), '1')) for color in color7])


  def show (self):
    '''
    顯示圖像
    '''

    cv2.imshow('image', self.image)
    cv2.imshow('bmp', self.bmp)
    cv2.waitKey(0)


  def save (self, name):
    '''
    儲存圖像
    '''

    cv2.imwrite(name, self.image)
