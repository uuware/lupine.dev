import { FloatWindow, FloatWindowCloseProps, FloatWindowShowProps } from './float-window';

export enum MessageBoxButtonProps {
  YesNo = 'yesno',
  OkCancel = 'okcancel',
  Ok = 'ok',
}
export type MessageBoxProps = FloatWindowShowProps & {
  buttonType: MessageBoxButtonProps;
};

export class MessageBox {
  static async show({
    title,
    children,
    contentMaxHeight,
    contentMinWidth,
    buttonType = MessageBoxButtonProps.OkCancel,
    noMoving = false,
    noModal = false,
    closeEvent,
    handleClicked,
    closeWhenClickOutside = false,
  }: MessageBoxProps): Promise<FloatWindowCloseProps> {
    const buttons =
      buttonType === MessageBoxButtonProps.OkCancel
        ? ['OK', 'Cancel']
        : buttonType === MessageBoxButtonProps.YesNo
        ? ['Yes', 'No']
        : ['OK'];
    return FloatWindow.show({
      title,
      children,
      contentMaxHeight,
      contentMinWidth,
      buttons,
      noMoving,
      noModal,
      closeEvent,
      handleClicked,
      closeWhenClickOutside,
    });
  }
}
