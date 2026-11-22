import * as migration_20261122_182916_initial from './20261122_182916_initial';
import * as migration_20261122_225500_articles_gallery_description from './20261122_225500_articles_gallery_description';

export const migrations = [
  {
    up: migration_20261122_182916_initial.up,
    down: migration_20261122_182916_initial.down,
    name: '20261122_182916_initial',
  },
  {
    up: migration_20261122_225500_articles_gallery_description.up,
    down: migration_20261122_225500_articles_gallery_description.down,
    name: '20261122_225500_articles_gallery_description',
  },
];
