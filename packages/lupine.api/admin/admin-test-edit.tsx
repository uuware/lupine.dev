import {
  CssProps,
  RefProps,
  EditableLabel,
  HtmlVar,
  ModalWindow,
  NotificationColor,
  NotificationMessage,
  PagingLink,
  ToggleBaseHookProps,
  ToggleSwitch,
  ToggleSwitchSize,
} from 'lupine.components';

type SampleDataProps = {
  id: number;
  name: string;
  info: string;
  checked: boolean;
};
const _DEFAULT_PAGE_LIMIT = 10;
const _DEFAULT_ITEM_COUNT = 101;
const sampleData: SampleDataProps[] = Array.from({ length: _DEFAULT_ITEM_COUNT }, (_, i) => ({
  id: i + 1,
  name: `Book Name ${i + 1}`,
  info: `This is the info field ${i + 1}`,
  checked: true,
}));
const getSampleData = (pageIndex = 0, searchTexts: string[] = []) => {
  const filterItems = sampleData.filter((item) =>
    searchTexts.every(
      (text) =>
        item.name.toLowerCase().includes(text.toLowerCase()) || item.info.toLowerCase().includes(text.toLowerCase())
    )
  );
  const pageLimit = _DEFAULT_PAGE_LIMIT;
  const itemsCount = filterItems.length;
  let maxPages = Math.floor(itemsCount / pageLimit);
  if (itemsCount % pageLimit !== 0) {
    maxPages++;
  }
  if (pageIndex > maxPages) {
    pageIndex = maxPages - 1;
  }
  const offset = pageIndex * pageLimit;
  return {
    status: 'ok',
    itemsCount,
    pageIndex,
    result: filterItems.slice(offset, offset + pageLimit),
  };
};
const removeSampleData = (itemId: number) => {
  const index = sampleData.findIndex((item) => item.id === itemId);
  if (index !== -1) {
    sampleData.splice(index, 1);
  }
};
const updateSampleData = (item: SampleDataProps) => {
  const index = sampleData.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    sampleData[index] = { ...item };
  } else {
    // it's a new record
    let newId = sampleData.length + 1;
    while (sampleData.some((item) => item.id === newId)) {
      newId++;
    }
    item.id = newId;
    sampleData.push({ ...item });
  }
  return item;
};

type SampleDataUpdateProps = {
  save?: () => SampleDataProps | null;
  cancel?: () => void;
};
// show dialog to edit one item, and call update when save the result
const showBookEditItem = async (item: SampleDataProps, update: (item: SampleDataProps) => void) => {
  const handleClicked = async (index: number) => {
    if (index === 0) {
      updateFn.cancel?.();
      modalClose();
    }
    if (index === 0) {
      const newItem = updateFn.save?.();
      if (newItem) {
        update(newItem);
        modalClose();
      }
    }
  };
  const updateFn: SampleDataUpdateProps = {};
  const modalClose = await ModalWindow.show({
    title: 'Edit Sample Data',
    buttons: ['Save', 'Cancel'],
    // contentMaxHeight: '400px',
    handleClicked,
    children: <BookEditItem item={item} update={updateFn}></BookEditItem>,
    closeWhenClickOutside: false,
  });
};

// edit one item
export const BookEditItem = (props: { item: SampleDataProps; update: SampleDataUpdateProps }) => {
  const ref: RefProps = { id: '' };
  const css: CssProps = {
    padding: '10px',
    border: 'solid 1px gray',
    margin: '1px',
    position: 'relative',
    '.lable': {
      width: '70px',
    },
  };
  props.update.save = () => {
    const name = ref.$('input.name').value;
    const info = ref.$('input.info').value;
    if (name && info) {
      const newItem = updateSampleData({ id: props.item.id, name, info, checked: switchUpdate.getChecked!() });
      props.item.name = newItem.name;
      props.item.info = newItem.info;
      props.item.checked = newItem.checked;
      props.item.id = newItem.id;
      return newItem;
    }
    NotificationMessage.sendMessage('Please input name and info', NotificationColor.Error);
    return null;
  };
  const switchUpdate: ToggleBaseHookProps = {};
  return (
    <div ref={ref} css={css} class='sample-data'>
      <div class='row-box'>
        <div class='lable'>Name: </div>
        <div>
          <input type='text' class='input-base name' value={props.item.name} />
        </div>
      </div>
      <div class='row-box mt-m'>
        <div class='lable'>Info: </div>
        <div>
          <input type='text' class='input-base info' value={props.item.info} />
        </div>
      </div>
      <div class='row-box mt-m'>
        <div class='lable'>Checked: </div>
        <ToggleSwitch size={ToggleSwitchSize.Small} hook={switchUpdate} checked={props.item.checked} />
      </div>
    </div>
  );
};

// show one item
export const BookShowItem = (props: { item: SampleDataProps }) => {
  const ref: RefProps = { id: '' };
  const css: CssProps = {
    padding: '10px',
    border: 'solid 1px gray',
    margin: '1px',
    position: 'relative',
    '.control-box': {
      display: 'none',
      position: 'absolute',
      right: '10px',
      top: '10px',
    },
    '&:hover .control-box': {
      display: 'block',
    },
    '.lable': {
      width: '70px',
    },
  };
  const onEdit = (ev: any) => {
    const update = (item: SampleDataProps) => {
      dom.value = makeDom(item);
    };
    showBookEditItem(props.item, update);
  };
  const onRemove = (ev: any) => {
    removeSampleData(props.item.id);
    ref.current.remove();
  };

  const makeDom = (item: SampleDataProps) => {
    const saveText = (text: string) => {
      item.name = text;
      updateSampleData(item);
      dom.value = makeDom(item);
    };
    return (
      <>
        <div class='control-box'>
          <button class='button-base button-ss' onClick={onEdit}>
            Edit
          </button>
          <button class='button-base button-ss' onClick={onRemove}>
            Delete
          </button>
        </div>
        <div class='row-box'>
          <div class='lable'>Name: </div>
          <div>{item.name}</div>
          <div class='px-m'>Double Click to edit: </div>
          <EditableLabel text={item.name} save={saveText} type='text' />
        </div>
        <div class='row-box'>
          <div class='lable'>Info: </div>
          <div>{item.info}</div>
        </div>
        <div class='row-box'>
          <div class='lable'>Checked: </div>
          <div>{item.checked ? 'Yes' : 'No'}</div>
        </div>
      </>
    );
  };

  const dom = HtmlVar(makeDom(props.item));
  return (
    <div ref={ref} css={css} class='sample-data'>
      {dom.node}
    </div>
  );
};

// show the list
export const BookList = () => {
  let currentIndex = 0;
  let searchTexts: string[] = [];
  let items = getSampleData(currentIndex, searchTexts);
  const ref: RefProps = { onLoad: async (self: Element) => {} };
  const onAdd = async () => {
    const update = (item: SampleDataProps) => {
      // new item is added at the list end, so update the last page
      currentIndex = Math.floor((items.itemsCount + 1) / _DEFAULT_PAGE_LIMIT);
      listDom.value = makeList(currentIndex);
    };
    showBookEditItem(
      {
        id: -1,
        name: '',
        info: '',
        checked: false,
      },
      update
    );
  };
  const onSearch = () => {
    searchTexts = ref.$('input.search').value.trim().split(' ');
    items = getSampleData(currentIndex, searchTexts);
    listDom.value = makeList(currentIndex);
  };
  const makeList = (pageIndex: number) => {
    const onLinkClick = (index: number) => {
      currentIndex = index;
      listDom.value = makeList(currentIndex);
    };
    const items = getSampleData(pageIndex, searchTexts);
    return (
      <div>
        <PagingLink
          itemsCount={items.itemsCount}
          pageIndex={pageIndex}
          pageLimit={_DEFAULT_PAGE_LIMIT}
          onClick={onLinkClick}
          baseLink=''
        ></PagingLink>
        {items.result.map((item) => (
          <BookShowItem item={item}></BookShowItem>
        ))}
        <PagingLink
          itemsCount={items.itemsCount}
          pageIndex={pageIndex}
          pageLimit={_DEFAULT_PAGE_LIMIT}
          onClick={onLinkClick}
          baseLink=''
        ></PagingLink>
      </div>
    );
  };
  const listDom = HtmlVar(makeList(currentIndex));
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    '.label': {
      width: '70px',
    },
  };
  return (
    <div ref={ref} css={css}>
      <div>
        <div class='row-box'>
          <div class='label'>Search: </div>
          <input type='text' class='input-base search' />
          <button class='button-base mr-s' onClick={onSearch}>
            Search
          </button>
          <button class='button-base' onClick={onAdd}>
            Add
          </button>
        </div>
      </div>
      <div class='list'>{listDom.node}</div>
    </div>
  );
};

export const AdminTestEditPage = () => {
  return (
    <div>
      <div>
        <div>Test editing.</div>
        <BookList />
      </div>
    </div>
  );
};
