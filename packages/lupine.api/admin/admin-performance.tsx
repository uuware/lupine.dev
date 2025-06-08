import { getRenderPageProps, RefProps, HtmlVar } from 'lupine.components';

export const AdminPerformancePage = () => {
  const fetchData = async () => {
    const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/performance/data');
    return data.json;
  };
  const onRefresh = async () => {
    const data = await fetchData();
    console.log(data);
    dom.value = <pre>{JSON.stringify(data, null, 2)}</pre>;
  };

  const ref: RefProps = {
    onLoad: async () => {
      onRefresh();
    },
  };
  const dom = HtmlVar('');
  return (
    <div ref={ref}>
      <button onClick={onRefresh} class='button-base'>
        Refresh
      </button>
      {dom.node}
    </div>
  );
};
