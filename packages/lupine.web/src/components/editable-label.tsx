import { CssProps, RefProps } from '../jsx';

export type EditableLabelHookProps = {
  updateValue?: (value: string) => void;
};

export type EditableLabelProps = {
  text: string;
  type?: 'text' | 'number';
  mandtory?: boolean;
  save?: (value: string) => void;
  hook?: EditableLabelHookProps;
};
export const EditableLabel = (props: EditableLabelProps) => {
  let editFlag = false;
  let oldValue = props.text;
  const onDblClick = () => {
    if (editFlag) return;
    editFlag = true;
    const el = ref.$('input.editable-label');
    oldValue = el.value;
    el.removeAttribute('readonly');
    el.classList.remove('not-editable');
    el.setSelectionRange(0, 0);
  };
  const reset = () => {
    const el = ref.$('input.editable-label');
    el.setAttribute('readonly', 'readonly');
    el.classList.add('not-editable');
    oldValue = '';
    editFlag = false;
    return el;
  };
  const onKeyDown = (ev: KeyboardEvent) => {
    if (!editFlag) return;
    if (ev.key === 'Enter') {
      onBlur();
    } else if (ev.key === 'Escape') {
      const el = ref.$('input.editable-label');
      el.value = oldValue;
      reset();
    }
  };
  const onBlur = () => {
    const savedValue = oldValue;
    const el = reset();
    if (savedValue !== el.value) {
      if (props.mandtory === true && !el.value) {
        el.value = savedValue;
      } else {
        props.save?.(el.value);
      }
    }
  };
  if (props.hook) {
    props.hook.updateValue = (value: string) => {
      const el = ref.$('input.editable-label');
      el.value = value;
    };
  }
  const css: CssProps = {
    '.not-editable': {
      borderColor: 'transparent',
      boxShadow: 'unset',
    },
    'input.editable-label': {
      width: '100%',
    },
  };
  const ref: RefProps = {};
  return (
    <div css={css} ref={ref}>
      <input
        class='input-base editable-label not-editable'
        onDblClick={onDblClick}
        onKeyDown={onKeyDown}
        value={props.text}
        onBlur={onBlur}
        readOnly
      />
    </div>
  );
};
