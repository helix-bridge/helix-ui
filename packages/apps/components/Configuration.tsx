import { ImportOutlined } from '@ant-design/icons';
import { DESCRIPTIONS, SYSTEM_ChAIN_CONFIGURATIONS } from 'shared/config/network';
import { Network } from 'shared/model';
import { addCustomChain, chainConfigs, readStorage, removeCustomChain, saveNetworkConfig } from 'shared/utils';
import { Alert, Button, Checkbox, Col, Form, Input, InputNumber, message, Modal, Row, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { isArray, isBoolean, isEqual, isNumber, isObject, isString, last } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface ConfigurationProps {
  network: Network;
}

// eslint-disable-next-line complexity
function getConfigControl(config: unknown, keys: (string | number)[]) {
  const lastKey = last(keys);
  const keysStr = keys.join('-');
  const descriptor = DESCRIPTIONS.find((item) => isEqual(item.path, keys.filter(isString)));

  const label =
    !lastKey || isNumber(lastKey) ? null : descriptor?.comment ? (
      <Tooltip title={<Trans>{descriptor?.comment}</Trans>}>{lastKey}</Tooltip>
    ) : (
      lastKey
    );

  const idx = keys.findIndex(isNumber);
  const namePath = [...keys];

  // remove parent path
  if (idx >= 1) {
    namePath.splice(idx - 1, 1);
  }

  if (isArray(config)) {
    return (
      <Form.Item label={label} key={keysStr} className="px-4 py-2 items-center">
        <Form.List name={namePath} key={keysStr}>
          {(_) => (
            <div className="list-container">
              {config.map((field, index) => (
                <div key={[...keys, index].join('-')} className="border-b border-gray-600">
                  {getConfigControl(field, [...keys, index])}
                </div>
              ))}
            </div>
          )}
        </Form.List>
      </Form.Item>
    );
  }

  if (isObject(config)) {
    return (
      <Form.Item key={keysStr} label={label} className="px-4 py-2 items-center">
        {Object.entries(config).map(([k, value]) => getConfigControl(value, [...keys, k]))}
      </Form.Item>
    );
  }

  return (
    <Form.Item
      key={keysStr}
      name={namePath}
      label={label}
      valuePropName={isBoolean(config) ? 'checked' : undefined}
      className="px-4 py-2"
    >
      {isNumber(config) ? (
        <InputNumber disabled={!descriptor?.editable} />
      ) : isBoolean(config) ? (
        <Checkbox disabled={!descriptor?.editable} />
      ) : (
        <Input disabled={!descriptor?.editable} />
      )}
    </Form.Item>
  );
}

export function Configuration({ network }: ConfigurationProps) {
  const { t } = useTranslation();

  const controls = getConfigControl(
    chainConfigs.find((item) => item.name === network),
    []
  );

  const [form] = useForm();
  const [isCustom, setIsCustom] = useState(false);

  const tip = useCallback(() => {
    message.success({
      content: t('Operation success, you need to refresh the page to use the configuration to take effect'),
      duration: 10,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { config = {}, custom = [] } = readStorage();

    if (config[network]) {
      form.setFieldsValue(config[network]);
    } else {
      form.resetFields();
    }

    setIsCustom(custom.includes(network));
  }, [network, form]);

  return (
    <>
      <Alert
        message={t(
          'Modifying the system configuration may lead to abnormal application functions, please be careful to modify'
        )}
        type="warning"
        showIcon
        closable
      />

      <Button
        onClick={() => {
          const target = SYSTEM_ChAIN_CONFIGURATIONS.find((item) => item.name === network);

          form.setFieldsValue(target);
        }}
        icon={<ImportOutlined style={{ verticalAlign: 0 }} className="transform rotate-180" />}
        className="my-4"
      >
        {t('Import System Configuration')}
      </Button>

      <Form
        layout="inline"
        form={form}
        name="configuration"
        onFinish={(values) => {
          saveNetworkConfig(values);
          message.success(t('Save success'));
        }}
      >
        <div className="w-full configuration-control-container">{controls}</div>

        <Row className="w-full px-4 my-4">
          <Col span={10}>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">
                {t('Save Only')}
              </Button>
            </Form.Item>
          </Col>

          <Col span={10} offset={4}>
            <Form.Item>
              <Button
                onClick={() => {
                  if (!isCustom) {
                    Modal.warning({
                      title: 'Replace Configuration',
                      content: t(`Are you sure to replace the configuration of ${network} ?`),
                      okText: t('Confirm'),
                      closable: true,
                      onOk: () => {
                        const values = form.getFieldsValue();

                        saveNetworkConfig(values);
                        addCustomChain(network);
                        setIsCustom(true);
                        tip();
                      },
                    });
                  } else {
                    removeCustomChain(network);
                    setIsCustom(false);
                    tip();
                  }
                }}
                type="primary"
                danger={!isCustom}
                className="w-full overflow-hidden"
              >
                {t(isCustom ? 'Restore System Configuration' : 'Store And Replace System Configuration')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
}
