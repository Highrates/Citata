import * as migration_20261122_182916_initial from './20261122_182916_initial';
import * as migration_20261122_225500_articles_gallery_description from './20261122_225500_articles_gallery_description';
import * as migration_20261123_084900_articles_author_nullable from './20261123_084900_articles_author_nullable';
import * as migration_20261123_092100_home_order from './20261123_092100_home_order';
import * as migration_20261126_201100_events_from_articles from './20261126_201100_events_from_articles';
import * as migration_20261126_204500_articles_drop_home_fields from './20261126_204500_articles_drop_home_fields';

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
  {
    up: migration_20261123_084900_articles_author_nullable.up,
    down: migration_20261123_084900_articles_author_nullable.down,
    name: '20261123_084900_articles_author_nullable',
  },
  {
    up: migration_20261123_092100_home_order.up,
    down: migration_20261123_092100_home_order.down,
    name: '20261123_092100_home_order',
  },
  {
    up: migration_20261126_201100_events_from_articles.up,
    down: migration_20261126_201100_events_from_articles.down,
    name: '20261126_201100_events_from_articles',
  },
  {
    up: migration_20261126_204500_articles_drop_home_fields.up,
    down: migration_20261126_204500_articles_drop_home_fields.down,
    name: '20261126_204500_articles_drop_home_fields',
  },
];
