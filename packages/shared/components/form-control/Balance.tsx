import { Input, InputNumber, InputNumberProps } from 'antd';
import { CSSProperties, PropsWithChildren, useCallback, useMemo } from 'react';
import { CustomFormControlProps } from '../../model';
import { getPrecisionByUnit } from '../../utils';

export function Balance({
  value,
  onChange,
  children,
  className,
  precision = getPrecisionByUnit('gwei'),
  ...other
}: CustomFormControlProps<string> & Omit<InputNumberProps<string>, 'value'> & PropsWithChildren<unknown>) {
  const triggerChange = useCallback(
    (val: string) => {
      if (onChange) {
        onChange(val);
      }
    },
    [onChange]
  );

  const getValue = useCallback(
    (inputValue: string) => {
      const [integer, decimal] = inputValue.split('.');

      if (!decimal) {
        return integer;
      }

      return decimal?.length > precision ? `${integer}.${decimal.substr(0, precision)}` : inputValue;
    },
    [precision]
  );

  const style = useMemo<CSSProperties>(() => {
    if (!children) {
      return {};
    }

    return {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    };
  }, [children]);

  return (
    <Input.Group className="flex items-center justify-between">
      <InputNumber<string>
        {...other}
        className={className}
        style={style}
        value={value}
        min="0"
        stringMode
        precision={precision}
        onChange={(event) => {
          const inputValue = event ? event.replace(/,/g, '') : '';

          triggerChange(getValue(inputValue));
        }}
      />
      {children}
    </Input.Group>
  );
}
