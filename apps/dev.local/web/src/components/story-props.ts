export type StoryCardProps = {
  title: string;
  description: string;
  music_url: string;
  cover_url: string;
  video_url?: string;
  author: string;
  view_count: number;
  download_count: number;
  collect_count: number;
  labels: string[];
  group_labels: string[];
  upload_date: string;
  start_time_seconds: number;
  state: string;
  remark: string;
  updatedstamp: string;
};
export type StoryCardShortProps = {
  id: number;
  title: string;
  cover_file: string;
  author: string;
  view_count: number;
  download_count: number;
  collect_count: number;
  start_time_seconds: number;
  management: boolean;
};

export type StoryListProps = {
  item: StoryCardShortProps;
};
