/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { BaseBlockchain } from '../nodes/Base Blockchain/Base Blockchain.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('BaseBlockchain Node', () => {
  let node: BaseBlockchain;

  beforeAll(() => {
    node = new BaseBlockchain();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Base Blockchain');
      expect(node.description.name).toBe('baseblockchain');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Block Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-key', baseUrl: 'https://mainnet.base.org' }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  test('getBlockByNumber should retrieve block by number', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getBlockByNumber');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('latest');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(true);
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: { number: '0x123', hash: '0xabc' }
    });

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ number: '0x123', hash: '0xabc' });
  });

  test('getBlockByHash should retrieve block by hash', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getBlockByHash');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('0xabcdef');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(false);
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: { number: '0x123', hash: '0xabcdef' }
    });

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ number: '0x123', hash: '0xabcdef' });
  });

  test('getLatestBlock should retrieve latest block number', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getLatestBlock');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: '0x123abc'
    });

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toBe('0x123abc');
  });

  test('getBlockTransactionCount should retrieve transaction count', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getBlockTransactionCount');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('latest');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: '0x42'
    });

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toBe('0x42');
  });

  test('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getLatestBlock');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Network error');
  });
});

describe('Transaction Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://mainnet.base.org'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  it('should get transaction by hash successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        hash: '0x123',
        blockNumber: '0x1',
        from: '0xabc',
        to: '0xdef'
      }
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransaction')
      .mockReturnValueOnce('0x123abc');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should handle get transaction errors', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransaction')
      .mockReturnValueOnce('0x123abc');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result[0].json.error).toBe('API Error');
  });

  it('should get transaction receipt successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        transactionHash: '0x123',
        status: '0x1',
        gasUsed: '0x5208'
      }
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransactionReceipt')
      .mockReturnValueOnce('0x123abc');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result[0].json).toEqual(mockResponse);
  });

  it('should send raw transaction successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: '0x123abc'
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('sendRawTransaction')
      .mockReturnValueOnce('0xsignedtxdata');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result[0].json).toEqual(mockResponse);
  });

  it('should estimate gas successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: '0x5208'
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('estimateGas')
      .mockReturnValueOnce('{"to":"0xabc","value":"0x0"}');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result[0].json).toEqual(mockResponse);
  });

  it('should get transaction count successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: '0xa'
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransactionCount')
      .mockReturnValueOnce('0xabc123')
      .mockReturnValueOnce('latest');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result[0].json).toEqual(mockResponse);
  });
});

describe('Account Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://mainnet.base.org'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      }
    };
  });

  describe('getBalance operation', () => {
    it('should get account balance successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x1b1ae4d6e2ef500000'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBalance')
        .mockReturnValueOnce('0x742e4758d8f3f0e5c6e8e5e5e5e5e5e5e5e5e5e5')
        .mockReturnValueOnce('latest');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle getBalance error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBalance')
        .mockReturnValueOnce('invalid-address')
        .mockReturnValueOnce('latest');

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'Invalid address' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getCode operation', () => {
    it('should get contract code successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x608060405234801561001057600080fd5b50'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getCode')
        .mockReturnValueOnce('0x742e4758d8f3f0e5c6e8e5e5e5e5e5e5e5e5e5e5')
        .mockReturnValueOnce('latest');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle getCode error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getCode')
        .mockReturnValueOnce('invalid-address')
        .mockReturnValueOnce('latest');

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'Invalid address' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getStorageAt operation', () => {
    it('should get storage value successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x0000000000000000000000000000000000000000000000000000000000000001'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getStorageAt')
        .mockReturnValueOnce('0x742e4758d8f3f0e5c6e8e5e5e5e5e5e5e5e5e5e5')
        .mockReturnValueOnce('latest')
        .mockReturnValueOnce('0x0');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle getStorageAt error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getStorageAt')
        .mockReturnValueOnce('invalid-address')
        .mockReturnValueOnce('latest')
        .mockReturnValueOnce('0x0');

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'Invalid address' },
        pairedItem: { item: 0 }
      }]);
    });
  });
});

describe('Contract Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://mainnet.base.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('call operation', () => {
    it('should execute contract call successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x0000000000000000000000000000000000000000000000000000000000000001'
      };
      
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('call')
        .mockReturnValueOnce({ to: '0x123', data: '0x456' })
        .mockReturnValueOnce('latest');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should handle call operation errors', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('call')
        .mockReturnValueOnce({ to: '0x123', data: '0x456' })
        .mockReturnValueOnce('latest');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('estimateGas operation', () => {
    it('should estimate gas successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x5208'
      };
      
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('estimateGas')
        .mockReturnValueOnce({ to: '0x123', data: '0x456' });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getLogs operation', () => {
    it('should get logs successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: [{ address: '0x123', topics: ['0x456'] }]
      };
      
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getLogs')
        .mockReturnValueOnce({ address: '0x123', topics: ['0x456'] });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getCode operation', () => {
    it('should get contract code successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x608060405234801561001057600080fd5b50'
      };
      
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getCode')
        .mockReturnValueOnce('0x123456789abcdef')
        .mockReturnValueOnce('latest');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });
});

describe('Token Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://mainnet.base.org'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  test('should get token balance successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBalance')
      .mockReturnValueOnce('0x1234567890abcdef')
      .mockReturnValueOnce('0xa9059cbb')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: '0x1bc16d674ec80000'
    });

    const items = [{ json: {} }];
    const result = await executeTokenOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x1bc16d674ec80000');
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://mainnet.base.org',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-key'
      },
      json: true,
      body: {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: '0x1234567890abcdef',
            data: '0xa9059cbb'
          },
          'latest'
        ],
        id: 1
      }
    });
  });

  test('should get token metadata successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getMetadata')
      .mockReturnValueOnce('0x1234567890abcdef')
      .mockReturnValueOnce('0x95d89b41')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000034554480000000000000000000000000000000000000000000000000000000000'
    });

    const items = [{ json: {} }];
    const result = await executeTokenOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          method: 'eth_call'
        })
      })
    );
  });

  test('should get token allowance successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAllowance')
      .mockReturnValueOnce('0x1234567890abcdef')
      .mockReturnValueOnce('0xdd62ed3e')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: '0x0'
    });

    const items = [{ json: {} }];
    const result = await executeTokenOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x0');
  });

  test('should get token transfer events successfully', async () => {
    const filterObject = {
      address: '0x1234567890abcdef',
      topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
      fromBlock: 'latest',
      toBlock: 'latest'
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransferEvents')
      .mockReturnValueOnce(filterObject);

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: []
    });

    const items = [{ json: {} }];
    const result = await executeTokenOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          method: 'eth_getLogs',
          params: [filterObject]
        })
      })
    );
  });

  test('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBalance')
      .mockReturnValueOnce('0x1234567890abcdef')
      .mockReturnValueOnce('0xa9059cbb')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const items = [{ json: {} }];
    await expect(executeTokenOperations.call(mockExecuteFunctions, items)).rejects.toThrow('API Error');
  });

  test('should continue on fail when enabled', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBalance')
      .mockReturnValueOnce('0x1234567890abcdef')
      .mockReturnValueOnce('0xa9059cbb')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const items = [{ json: {} }];
    const result = await executeTokenOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
});

describe('Network Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-key', baseUrl: 'https://mainnet.base.org' }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  describe('getChainId', () => {
    it('should successfully get chain ID', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getChainId');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        jsonrpc: '2.0', 
        id: 1, 
        result: '0x2105' 
      });

      const result = await executeNetworkOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://mainnet.base.org',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key',
        },
        body: {
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1,
        },
        json: true,
      });
      expect(result).toHaveLength(1);
      expect(result[0].json.result).toBe('0x2105');
    });

    it('should handle errors when getting chain ID fails', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getChainId');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeNetworkOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Network error');
    });
  });

  describe('getGasPrice', () => {
    it('should successfully get gas price', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getGasPrice');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        jsonrpc: '2.0', 
        id: 1, 
        result: '0x9502f9000' 
      });

      const result = await executeNetworkOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://mainnet.base.org',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key',
        },
        body: {
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 1,
        },
        json: true,
      });
      expect(result).toHaveLength(1);
      expect(result[0].json.result).toBe('0x9502f9000');
    });
  });

  describe('getFeeHistory', () => {
    it('should successfully get fee history', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getFeeHistory')
        .mockReturnValueOnce(4)
        .mockReturnValueOnce('latest')
        .mockReturnValueOnce([25, 50, 75]);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        jsonrpc: '2.0', 
        id: 1, 
        result: { baseFeePerGas: ['0x12a05f200'], gasUsedRatio: [0.5] }
      });

      const result = await executeNetworkOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://mainnet.base.org',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key',
        },
        body: {
          jsonrpc: '2.0',
          method: 'eth_feeHistory',
          params: ['0x4', 'latest', [25, 50, 75]],
          id: 1,
        },
        json: true,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('syncing', () => {
    it('should successfully get sync status', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('syncing');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        jsonrpc: '2.0', 
        id: 1, 
        result: false 
      });

      const result = await executeNetworkOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://mainnet.base.org',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key',
        },
        body: {
          jsonrpc: '2.0',
          method: 'eth_syncing',
          params: [],
          id: 1,
        },
        json: true,
      });
      expect(result).toHaveLength(1);
      expect(result[0].json.result).toBe(false);
    });
  });
});
});
