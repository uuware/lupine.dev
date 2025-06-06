let flag = 0;
export const debugWatch = (port: number) => {
  console.log('Creating debug-watch socket');
  const socket = new WebSocket('ws://localhost:' + port + '/debug/client');
  window.addEventListener('beforeunload', () => {
    socket.close();
  });
  socket.onopen = () => {
    // console.log('Socket open.');
    socket.send(JSON.stringify({ message: 'get-flag' }));
  };
  socket.onmessage = (message) => {
    try {
      const jsonData = JSON.parse(message.data);
      console.log('Debug socket message:', jsonData);
      if (jsonData && jsonData.flag) {
        if (!flag) {
          flag = jsonData.flag;
        } else if (flag !== jsonData.flag) {
          document.location.reload();
        }
      }
    } catch {}
  };
  socket.onclose = () => {
    console.log('Debug socket close.');
    setTimeout(() => {
      debugWatch(port);
    }, 3000);
  };
};
