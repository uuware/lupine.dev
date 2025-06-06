import { PageProps } from 'lupine.web';

export const NotFoundPage = async (props: PageProps) => {
  return (
    <div>
      <div>Not found.</div>
      <div>
        Goto <a href='/'>Home</a>
      </div>
    </div>
  );
};
