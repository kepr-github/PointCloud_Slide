import * as title from './slideTypes/title.js';
import * as list from './slideTypes/list.js';
import * as code from './slideTypes/code.js';
import * as image from './slideTypes/image.js';
import * as video from './slideTypes/video.js';
import * as pointCloud from './slideTypes/pointCloud.js';
import * as end from './slideTypes/end.js';

export const slideRegistry = {
  title,
  list,
  code,
  image,
  video,
  pointCloud,
  end
};

export function registerSlideType(type, renderer) {
  slideRegistry[type] = renderer;
}
