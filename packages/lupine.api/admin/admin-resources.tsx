import {
  CssProps,
  DomUtils,
  formatBytes,
  getRenderPageProps,
  HtmlVar,
  MessageBox,
  MessageBoxButtonProps,
  NotificationColor,
  NotificationMessage,
  RefProps,
  ProgressHookProps,
  uploadFile,
  Progress,
  InputWithTitle,
} from 'lupine.web';

// https://www.toptal.com/designers/htmlarrows/symbols/
const ResourcesList = (props: {
  results: any;
  onDownload: (name: string) => void;
  onUploadLocal: (name: string) => void;
  onRename: (fPath: string, fName: string) => void;
  onRemove: (name: string) => void;
  onListFolder: (folder: string) => void;
  resourcesFullPath: string;
}) => {
  const listFolder = (results: any, parentFolder = '') => {
    return results.map((result: any) => (
      <div>
        <div class='row-box mt-m'>
          <label class='label mr-m f-name'>{result.name}</label>
          <label class='label mr-m f-time'>{result.time}</label>
          <label class='label mr-m f-size'>{typeof result.size !== 'undefined' && formatBytes(result.size)}</label>
          {typeof result.size !== 'undefined' && (
            <div>
              <button
                title='Download remote file'
                onClick={() => props.onDownload(parentFolder + result.name)}
                class='button-base button-s'
              >
                &#8681;
              </button>
              <button
                title='Rename remote file'
                onClick={() => props.onRename(parentFolder + result.name, result.name)}
                class='button-base button-s'
              >
                &#8654;
              </button>
              <button
                title='Delete remote file'
                onClick={() => props.onRemove(parentFolder + result.name)}
                class='button-base button-s'
              >
                &#10008;
              </button>
            </div>
          )}
          {typeof result.size === 'undefined' && (
            <div>
              <button onClick={() => props.onListFolder(parentFolder + result.name)} class='button-base button-s'>
                &#8680;
              </button>
              <button
                title='Choose a local file to upload to remote'
                onClick={() => props.onUploadLocal(parentFolder + result.name)}
                class='button-base button-s'
              >
                &#8686;
              </button>
            </div>
          )}
        </div>
        {result.items && <div class='pl-ll'>{listFolder(result.items, result.name + '/')}</div>}
      </div>
    ));
  };
  const css: CssProps = {
    '.f-name': {
      width: '200px',
    },
    '.f-size span, .f-time span': {
      color: 'red',
    },
  };
  return (
    <div css={css}>
      <div class='row-box mt-m mr-s'>
        <button title='Go up' onClick={() => props.onListFolder('..')} class='button-base button-s mr-m'>
          &#8678;
        </button>
        <button title='Refresh' onClick={() => props.onListFolder('')} class='button-base button-s'>
          &#8691;
        </button>
        <button
          title='Choose a local file to upload to remote'
          onClick={() => props.onUploadLocal('')}
          class='button-base button-s'
        >
          &#8686;
        </button>
      </div>
      <div class='label mx-m f-name'>{props.resourcesFullPath}</div>
      {listFolder(props.results)}
    </div>
  );
};
export const AdminResourcesPage = () => {
  const domLog = HtmlVar('');
  const domUpdate = HtmlVar('');

  let resourcesFullPath = '';
  const onResources = async () => {
    loasResources('/');
  };
  const loasResources = async (folder: string) => {
    const onListFolder = (folder: string) => {
      loasResources(resourcesFullPath + folder);
    };

    let pathForUpload = '';
    const uploadFile = async (fPath: string) => {
      pathForUpload = fPath;
      const fDom = DomUtils.bySelector('.up-file') as HTMLInputElement;
      fDom.click();
    };
    const onUploadLocal = (fPath: string) => {
      MessageBox.show({
        title: 'Override remote file',
        buttonType: MessageBoxButtonProps.YesNo,
        contentMinWidth: '300px',
        handleClicked: (index: number, close) => {
          if (index === 0) {
            uploadFile(fPath);
          }
          close();
        },
        children: <div>Do you upload local files that may overwrite remote file [{fPath}]?</div>,
      });
    };

    const onDownload = async (name: string) => {
      const response = await getRenderPageProps().renderPageFunctions.fetchData(
        '/api/admin/resources/download',
        {
          resource: resourcesFullPath + name,
        },
        true
      );
      if (!response || !response.blob) {
        NotificationMessage.sendMessage('Failed to get resource', NotificationColor.Error);
        return;
      }

      DomUtils.downloadStream(await response.blob(), name);
    };

    const renameFile = async (fPath: string, fName: string, fNewName: string) => {
      const response = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/resources/rename', {
        resource: resourcesFullPath + fPath,
        oldName: fName,
        newName: fNewName,
      });
      const dataResponse = await response.json;
      if (!dataResponse || dataResponse.status !== 'ok') {
        NotificationMessage.sendMessage(dataResponse.message || 'Failed to rename resource', NotificationColor.Error);
        return;
      }
      NotificationMessage.sendMessage(
        'Resource renamed successfully, you need to refresh the page',
        NotificationColor.Success
      );
    };
    const onRename = async (fPath: string, fName: string) => {
      let newName = '';
      const content = InputWithTitle('Reanme to:', fName, (value: string) => {
        newName = value;
      });
      MessageBox.show({
        title: 'Input new name',
        buttonType: MessageBoxButtonProps.OkCancel,
        contentMinWidth: '300px',
        handleClicked: async (index: number, close) => {
          if (index === 0) {
            await renameFile(fPath, fName, newName);
          }
          close();
        },
        children: content,
      });
    };
    const removeFile = async (name: string) => {
      const response = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/resources/remove', {
        resource: resourcesFullPath + name,
      });
      const dataResponse = await response.json;
      if (!dataResponse || dataResponse.status !== 'ok') {
        NotificationMessage.sendMessage(dataResponse.message || 'Failed to remove resource', NotificationColor.Error);
        return;
      }
      NotificationMessage.sendMessage(
        'Resource removed successfully, you need to refresh the page',
        NotificationColor.Success
      );
    };
    const onRemove = async (name: string) => {
      MessageBox.show({
        title: 'Remove file on remote system',
        buttonType: MessageBoxButtonProps.YesNo,
        contentMinWidth: '300px',
        handleClicked: (index: number, close) => {
          if (index === 0) {
            removeFile(name);
          }
          close();
        },
        children: <div>Do you really want to remove the remote file [{name}]?</div>,
      });
    };

    const response = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/resources/data', {
      folder,
    });
    const dataResponse = await response.json;
    if (!dataResponse || dataResponse.status !== 'ok') {
      NotificationMessage.sendMessage(dataResponse.message || 'Failed to get resources', NotificationColor.Error);
      return;
    }

    // dataResponse.results' first item has the fullPath
    resourcesFullPath = dataResponse.results[0].fullPath;
    if (!resourcesFullPath.endsWith('/') && !resourcesFullPath.endsWith('\\')) {
      resourcesFullPath += '/';
    }
    domUpdate.value = (
      <ResourcesList
        results={dataResponse.results.slice(1)}
        onDownload={onDownload}
        onUploadLocal={onUploadLocal}
        onRename={onRename}
        onRemove={onRemove}
        onListFolder={onListFolder}
        resourcesFullPath={resourcesFullPath}
      />
    );
    domLog.value = <pre>{JSON.stringify(dataResponse, null, 2)}</pre>;
  };

  const progressUpdate: ProgressHookProps = {};
  const onUploadProgress = (percentage: number, chunkNumber: number, totalChunks: number) => {
    progressUpdate.onProgress?.(percentage, chunkNumber, totalChunks);
  };
  const onFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    progressUpdate.onShow?.(true, 'Uploading resource');
    progressUpdate.onProgress?.(0, 0, 100);
    const uploadResult = await uploadFile(
      file,
      '/api/admin/resources/upload?n=' + file.name + '&p=' + resourcesFullPath,
      onUploadProgress
    );

    setTimeout(() => {
      progressUpdate.onShow?.(false);
    }, 1000);

    if (!uploadResult) {
      NotificationMessage.sendMessage('Failed to upload resource', NotificationColor.Error);
      return;
    }
    NotificationMessage.sendMessage(
      'Resource uploaded successfully, you need to refresh the page',
      NotificationColor.Success
    );
  };
  const css: CssProps = {};
  return (
    <div css={css} class='admin-release-top'>
      <div class='row-box mt1 mb1'>
        <button onClick={onResources} class='button-base'>
          Resources
        </button>
      </div>
      {domUpdate.node}
      {domLog.node}
      <Progress hook={progressUpdate} />
      <input type='file' class='d-none up-file' onChange={onFileChange} accept='.*' />
    </div>
  );
};
