import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { Button, Form, Input, Select } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { walletIdentifierState } from '../../recoil/atom';
import './create.less';
import { reconstructCustomConfig, Wallet } from '../../models/Wallet';
import { walletService } from '../../service/WalletService';
import { WalletCreateOptions } from '../../service/WalletCreator';
import { DefaultWalletConfigs } from '../../config/StaticConfig';
import logo from '../../assets/logo-products-chain.svg';
import SuccessModalPopup from '../../components/SuccessModalPopup/SuccessModalPopup';
import ErrorModalPopup from '../../components/ErrorModalPopup/ErrorModalPopup';
import { Session } from '../../models/Session';
// import PasswordFormModal from '../../components/PasswordForm/PasswordFormModal';
// import PasswordFormContainer from '../../components/PasswordForm/PasswordFormContainer';
import BackButton from '../../components/BackButton/BackButton';

const layout = {
  // labelCol: { span: 8 },
  // wrapperCol: { span: 16 },
};
const tailLayout = {
  // wrapperCol: { offset: 8, span: 16 },
};

interface FormCustomConfigProps {
  setIsConnected: (arg: boolean) => void;
  setIsCreateDisable: (arg: boolean) => void;
  setNetworkConfig: (arg: any) => void;
}

interface FormCreateProps {
  form: FormInstance;
  isCreateDisable: boolean;
  isSelectFieldDisable: boolean;
  setWalletIdentifier: (walletIdentifier: string) => void;
  setIsCustomConfig: (arg: boolean) => void;
  setIsConnected: (arg: boolean) => void;
  setIsCreateDisable: (arg: boolean) => void;
  setIsSelectFieldDisable: (arg: boolean) => void;
  networkConfig: any;
}

const FormCustomConfig: React.FC<FormCustomConfigProps> = props => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [checkingNodeConnection, setCheckingNodeConnection] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    props.setIsConnected(true);
    props.setIsCreateDisable(false);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showErrorModal = () => {
    setIsErrorModalVisible(true);
  };

  const handleErrorOk = () => {
    setIsErrorModalVisible(false);
  };

  const handleErrorCancel = () => {
    setIsErrorModalVisible(false);
  };

  const checkNodeConnectivity = async () => {
    // TO-DO Node Connectivity check
    form.validateFields().then(async values => {
      setCheckingNodeConnection(true);
      const { nodeUrl } = values;
      const isNodeLive = await walletService.checkNodeIsLive(nodeUrl);
      setCheckingNodeConnection(false);

      if (isNodeLive) {
        showModal();
        props.setNetworkConfig(values);
      } else {
        showErrorModal();
      }
    });
  };

  return (
    <Form layout="vertical" form={form} name="control-ref">
      <Form.Item
        name="derivationPath"
        label="Derivation Path"
        hasFeedback
        rules={[{ required: true, message: 'Derivation Path is required' }]}
      >
        <Input maxLength={36} placeholder="Derivation Path" />
      </Form.Item>
      <Form.Item
        name="nodeUrl"
        label="Node URL"
        hasFeedback
        rules={[
          { required: true, message: 'Node URL is required' },
          {
            pattern: /(https?:\/\/)?[\w\-~]+(\.[\w\-~]+)+(\/[\w\-~]*)*(#[\w-]*)?(\?.*)?/,
            message: 'Please enter a valid node url',
          },
        ]}
      >
        <Input placeholder="Node URL" />
      </Form.Item>

      <div className="row">
        <Form.Item
          name="addressPrefix"
          label="Address Prefix"
          hasFeedback
          rules={[{ required: true, message: 'Address Prefix is required' }]}
        >
          <Input placeholder="Address Prefix" />
        </Form.Item>
        <Form.Item
          name="chainId"
          label="Chain ID"
          hasFeedback
          rules={[{ required: true, message: 'Chain ID is required' }]}
        >
          <Input placeholder="Chain ID" />
        </Form.Item>
      </div>
      <div className="row">
        <Form.Item
          name="baseDenom"
          label="Base Denom"
          hasFeedback
          rules={[{ required: true, message: 'Base Denom is required' }]}
        >
          <Input placeholder="Base Denom" />
        </Form.Item>
        <Form.Item
          name="croDenom"
          label="CRO Denom"
          hasFeedback
          rules={[{ required: true, message: 'CRO Denom is required' }]}
        >
          <Input placeholder="CRO Denom" />
        </Form.Item>
      </div>

      <SuccessModalPopup
        isModalVisible={isModalVisible}
        handleCancel={handleCancel}
        handleOk={handleOk}
        title="Success!"
        button={
          <Button type="primary" onClick={checkNodeConnectivity} loading={checkingNodeConnection}>
            Connect
          </Button>
        }
        footer={[
          <Button key="submit" type="primary" onClick={handleOk}>
            Next
          </Button>,
        ]}
      >
        <>
          <div className="description">Your node is connected!</div>
        </>
      </SuccessModalPopup>
      <ErrorModalPopup
        isModalVisible={isErrorModalVisible}
        handleCancel={handleErrorCancel}
        handleOk={handleErrorOk}
        title="An error happened!"
        footer={[]}
      >
        <>
          <div className="description">
            Your Network Configuration is invalid. Please check again.
          </div>
        </>
      </ErrorModalPopup>
    </Form>
  );
};

const FormCreate: React.FC<FormCreateProps> = props => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [wallet, setWallet] = useState<Wallet>();

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    setIsModalVisible(false);
    props.setWalletIdentifier(wallet?.identifier ?? '');
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    props.setWalletIdentifier(wallet?.identifier ?? '');
  };

  const handleErrorOk = () => {
    setIsErrorModalVisible(false);
  };

  const handleErrorCancel = () => {
    setIsErrorModalVisible(false);
  };

  const showErrorModal = () => {
    setIsErrorModalVisible(true);
  };

  const onChange = () => {
    const { name } = props.form.getFieldsValue();
    if (name !== '') {
      props.setIsSelectFieldDisable(false);
    } else {
      props.setIsSelectFieldDisable(true);
    }
  };

  const onNetworkChange = (network: string) => {
    props.form.setFieldsValue({ network });
    if (network === DefaultWalletConfigs.CustomDevNet.name) {
      props.setIsCustomConfig(true);
      props.setIsConnected(false);
      props.setIsCreateDisable(true);
    }
  };

  const onWalletCreateFinish = async () => {
    setCreateLoading(true);
    const { name, network } = props.form.getFieldsValue();

    if (!name || !network) {
      return;
    }
    let selectedNetworkConfig = walletService
      .supportedConfigs()
      .find(config => config.name === network);

    // If the dev-net custom network was selected, we pass the values that were input in the dev-net config UI fields
    if (selectedNetworkConfig?.name === DefaultWalletConfigs.CustomDevNet.name) {
      let customDevnetConfig;
      if (props.networkConfig) {
        customDevnetConfig = reconstructCustomConfig(props.networkConfig);
        selectedNetworkConfig = customDevnetConfig;

        // eslint-disable-next-line no-console
        console.log('props.networkConfig', selectedNetworkConfig);
      }
    }

    if (!selectedNetworkConfig) {
      return;
    }

    const createOptions: WalletCreateOptions = {
      walletName: name,
      config: selectedNetworkConfig,
    };

    try {
      const createdWallet = await walletService.createAndSaveWallet(createOptions);
      await walletService.setCurrentSession(new Session(createdWallet));
      setWallet(createdWallet);
      setCreateLoading(false);
      showModal();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('issue on wallet create', e);

      setCreateLoading(false);
      showErrorModal();
      return;
    }

    props.form.resetFields();
  };

  return (
    <Form
      {...layout}
      layout="vertical"
      form={props.form}
      name="control-ref"
      onFinish={onWalletCreateFinish}
      onChange={onChange}
    >
      <Form.Item
        name="name"
        label="Wallet Name"
        hasFeedback
        rules={[{ required: true, message: 'Wallet name is required' }]}
      >
        <Input maxLength={36} placeholder="Wallet name" />
      </Form.Item>
      <Form.Item name="network" label="Network" rules={[{ required: true }]}>
        <Select
          placeholder="Select wallet network"
          onChange={onNetworkChange}
          disabled={props.isSelectFieldDisable}
        >
          {walletService.supportedConfigs().map(config => (
            <Select.Option key={config.name} value={config.name} disabled={!config.enabled}>
              {config.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item {...tailLayout}>
        <SuccessModalPopup
          isModalVisible={isModalVisible}
          handleCancel={handleCancel}
          handleOk={handleOk}
          title="Success!"
          button={
            <Button
              type="primary"
              htmlType="submit"
              disabled={props.isCreateDisable}
              loading={createLoading}
            >
              Create Wallet
            </Button>
          }
          footer={[
            <Button key="submit" type="primary" onClick={handleOk}>
              Next
            </Button>,
          ]}
        >
          <>
            <div className="description">Your wallet has been created!</div>
          </>
        </SuccessModalPopup>
        <ErrorModalPopup
          isModalVisible={isErrorModalVisible}
          handleCancel={handleErrorCancel}
          handleOk={handleErrorOk}
          title="An error happened!"
          footer={[]}
        >
          <>
            <div className="description">
              Failed to create wallet, the derivation phrase might be incorrect.
            </div>
          </>
        </ErrorModalPopup>
      </Form.Item>
    </Form>
  );
};

const CreatePage = () => {
  const [form] = Form.useForm();
  const [isCreateDisable, setIsCreateDisable] = useState(false);
  const [isCustomConfig, setIsCustomConfig] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSelectFieldDisable, setIsSelectFieldDisable] = useState(true);
  const [networkConfig, setNetworkConfig] = useState();
  const [walletIdentifier, setWalletIdentifier] = useRecoilState(walletIdentifierState);
  const didMountRef = useRef(false);
  const history = useHistory();

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
    } else {
      // Jump to backup screen after walletIdentifier created & setWalletIdentifier finished
      history.push({
        pathname: '/create/backup',
        state: { walletIdentifier },
      });
    }
  }, [walletIdentifier, history]);

  return (
    <main className="create-page">
      <div className="header">
        <img src={logo} className="logo" alt="logo" />
      </div>
      <div className="container">
        <BackButton />
        <div>
          <div className="title">
            {!isCustomConfig || isConnected ? 'Create Wallet' : 'Custom Configuration'}
          </div>
          <div className="slogan">
            {!isCustomConfig || isConnected
              ? 'Create a name and select the network for your wallet.'
              : 'Fill in the below to connect to this custom network.'}
          </div>

          {!isCustomConfig || isConnected ? (
            <FormCreate
              form={form}
              isCreateDisable={isCreateDisable}
              isSelectFieldDisable={isSelectFieldDisable}
              setIsSelectFieldDisable={setIsSelectFieldDisable}
              setWalletIdentifier={setWalletIdentifier}
              setIsCustomConfig={setIsCustomConfig}
              setIsConnected={setIsConnected}
              setIsCreateDisable={setIsCreateDisable}
              networkConfig={networkConfig}
            />
          ) : (
            <FormCustomConfig
              setIsConnected={setIsConnected}
              setIsCreateDisable={setIsCreateDisable}
              setNetworkConfig={setNetworkConfig}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default CreatePage;
