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

    it('should define 7 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(7);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(7);
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
describe('Accounts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.basescan.org/api',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should get balance for single address', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'getBalance';
        case 'address':
          return '0x742d35Cc6339C4532CE58b2D6C1Ed19C7BF1a05A';
        case 'tag':
          return 'latest';
        default:
          return undefined;
      }
    });

    const mockResponse = {
      status: '1',
      message: 'OK',
      result: '1000000000000000000'
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.basescan.org/api',
      qs: {
        module: 'account',
        action: 'balance',
        address: '0x742d35Cc6339C4532CE58b2D6C1Ed19C7BF1a05A',
        tag: 'latest',
        apikey: 'test-api-key',
      },
      json: true,
    });
  });

  test('should get multiple balances', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'getMultipleBalances';
        case 'addresses':
          return '0x742d35Cc6339C4532CE58b2D6C1Ed19C7BF1a05A,0x123d35Cc6339C4532CE58b2D6C1Ed19C7BF1a05B';
        case 'tag':
          return 'latest';
        default:
          return undefined;
      }
    });

    const mockResponse = {
      status: '1',
      message: 'OK',
      result: [
        { account: '0x742d35Cc6339C4532CE58b2D6C1Ed19C7BF1a05A', balance: '1000000000000000000' },
        { account: '0x123d35Cc6339C4532CE58b2D6C1Ed19C7BF1a05B', balance: '2000000000000000000' }
      ]
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('should get transactions list', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'getTransactions';
        case 'address':
          return '0x742d35Cc6339C4532CE58b2D6C1Ed19C7BF1a05A';
        case 'startblock':
          return 0;
        case 'endblock':
          return 99999999;
        case 'page':
          return 1;
        case 'offset':
          return 10;
        case 'sort':
          return 'asc';
        default:
          return undefined;
      }
    });

    const mockResponse = {
      status: '1',
      message: 'OK',
      result: [
        {
          hash: '0x123...',
          from: '0x742d35Cc6339C4532CE58b2D6C1Ed19C7BF1a05A',
          to: '0x456...',
          value: '1000000000000000000'
        }
      ]
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('should get token transactions', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'getTokenTransactions';
        case 'address':
          return '0x742d35Cc6339C4532CE58b2D6C1Ed19C7BF1a05A';
        case 'contractaddress':
          return '0xA0b86a33E6411b9b2a4a6a5e4E7d2f0D0d0d0d0d';
        case 'startblock':
          return 0;
        case 'endblock':
          return 99999999;
        case 'page':
          return 1;
        case 'offset':
          return 10;
        case 'sort':
          return 'asc';
        default:
          return undefined;
      }
    });

    const mockResponse = {
      status: '1',
      message: 'OK',
      result: [
        {
          hash: '0x123...',
          from: '0x742d35Cc6339C4532CE58b2D6C1Ed19C7BF1a05A',
          to: '0x456...',
          value: '1000000000000000000',
          contractAddress: '0xA0b86a33E6411b9b2a4a6a5e4e7d2f0D0d0d0d0d'
        }
      ]
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'getBalance';
        case 'address':
          return 'invalid-address';
        case 'tag':
          return 'latest';
        default:
          return undefined;
      }
    });

    const mockErrorResponse = {
      status: '0',
      message: 'NOTOK',
      result: 'Invalid address format'
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

    await expect(executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow();
  });

  test('should handle continue on fail', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'getBalance';
        case 'address':
          return '0x742d35Cc6339C4532CE58b2D6C1Ed19C7BF1a05A';
        case 'tag':
          return 'latest';
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

    const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ error: 'Network error' });
  });
});

describe('Transactions Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.basescan.org/api',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getTransaction', () => {
    it('should get transaction information successfully', async () => {
      const mockResponse = {
        status: '1',
        result: {
          hash: '0x1234567890abcdef',
          from: '0xfrom',
          to: '0xto',
          value: '1000000000000000000',
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getTransaction';
        if (paramName === 'txhash') return '0x1234567890abcdef';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.basescan.org/api',
        qs: {
          module: 'proxy',
          action: 'eth_getTransactionByHash',
          txhash: '0x1234567890abcdef',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });

    it('should handle API errors', async () => {
      const mockErrorResponse = {
        error: { code: -32000, message: 'Transaction not found' },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getTransaction';
        if (paramName === 'txhash') return '0xinvalid';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

      await expect(
        executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });
  });

  describe('getTransactionReceipt', () => {
    it('should get transaction receipt successfully', async () => {
      const mockResponse = {
        status: '1',
        result: {
          transactionHash: '0x1234567890abcdef',
          status: '0x1',
          gasUsed: '0x5208',
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getTransactionReceipt';
        if (paramName === 'txhash') return '0x1234567890abcdef';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getTransactionCount', () => {
    it('should get transaction count successfully', async () => {
      const mockResponse = {
        status: '1',
        result: '0x64',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getTransactionCount';
        if (paramName === 'address') return '0x1234567890abcdef1234567890abcdef12345678';
        if (paramName === 'tag') return 'latest';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('sendRawTransaction', () => {
    it('should send raw transaction successfully', async () => {
      const mockResponse = {
        status: '1',
        result: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'sendRawTransaction';
        if (paramName === 'hex') return '0xf86c808504a817c800825208941234567890abcdef1234567890abcdef12345678880de0b6b3a76400008025a0';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getTransaction';
        if (paramName === 'txhash') return '0xinvalid';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Network error');
    });

    it('should throw error for unknown operation', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

      await expect(
        executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Unknown operation: unknownOperation');
    });
  });
});

describe('Tokens Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.basescan.org/api',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getTokenBalance', () => {
    it('should get token balance successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: '1000000000000000000',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getTokenBalance';
          case 'contractaddress': return '0xa0b86a33e6441e60f8a0fc6a0d74a7a42e5b6f1c';
          case 'address': return '0x742d35cc619c2f8b2c8c3c7f7b8b8c5d5e5f5e6f';
          case 'tag': return 'latest';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTokensOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=0xa0b86a33e6441e60f8a0fc6a0d74a7a42e5b6f1c&address=0x742d35cc619c2f8b2c8c3c7f7b8b8c5d5e5f5e6f&tag=latest&apikey=test-api-key',
        json: true,
      });
    });

    it('should handle API error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getTokenBalance';
          case 'contractaddress': return 'invalid';
          case 'address': return 'invalid';
          case 'tag': return 'latest';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];
      
      await expect(executeTokensOperations.call(mockExecuteFunctions, items))
        .rejects.toThrow('API Error');
    });
  });

  describe('getNFTTransactions', () => {
    it('should get NFT transactions successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            blockNumber: '12345678',
            timeStamp: '1638360000',
            hash: '0xabc123',
            from: '0x742d35cc619c2f8b2c8c3c7f7b8b8c5d5e5f5e6f',
            to: '0x123456789abcdef',
            tokenID: '1',
            contractAddress: '0xa0b86a33e6441e60f8a0fc6a0d74a7a42e5b6f1c',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getNFTTransactions';
          case 'address': return '0x742d35cc619c2f8b2c8c3c7f7b8b8c5d5e5f5e6f';
          case 'contractaddress': return '0xa0b86a33e6441e60f8a0fc6a0d74a7a42e5b6f1c';
          case 'startblock': return 0;
          case 'endblock': return 99999999;
          case 'page': return 1;
          case 'offset': return 10;
          case 'sort': return 'asc';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTokensOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getTokenInfo', () => {
    it('should get token info successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            contractAddress: '0xa0b86a33e6441e60f8a0fc6a0d74a7a42e5b6f1c',
            tokenName: 'Test Token',
            symbol: 'TEST',
            divisor: '18',
            tokenType: 'ERC-20',
            totalSupply: '1000000000000000000000000',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getTokenInfo';
          case 'contractaddress': return '0xa0b86a33e6441e60f8a0fc6a0d74a7a42e5b6f1c';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTokensOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getAddressTokenBalance', () => {
    it('should get address token balance successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            TokenAddress: '0xa0b86a33e6441e60f8a0fc6a0d74a7a42e5b6f1c',
            TokenName: 'Test Token',
            TokenSymbol: 'TEST',
            TokenQuantity: '1000000000000000000',
            TokenDivisor: '18',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getAddressTokenBalance';
          case 'address': return '0x742d35cc619c2f8b2c8c3c7f7b8b8c5d5e5f5e6f';
          case 'contractaddress': return '0xa0b86a33e6441e60f8a0fc6a0d74a7a42e5b6f1c';
          case 'page': return 1;
          case 'offset': return 10;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTokensOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getTokenHolders', () => {
    it('should get token holders successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            TokenHolderAddress: '0x742d35cc619c2f8b2c8c3c7f7b8b8c5d5e5f5e6f',
            TokenHolderQuantity: '1000000000000000000',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getTokenHolders';
          case 'contractaddress': return '0xa0b86a33e6441e60f8a0fc6a0d74a7a42e5b6f1c';
          case 'page': return 1;
          case 'offset': return 10;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTokensOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });
});

describe('Contracts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.basescan.org/api',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getContractABI', () => {
    it('should get contract ABI successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: '[{"type":"constructor","inputs":[]}]',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getContractABI';
        if (param === 'address') return '0x1234567890123456789012345678901234567890';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.status).toBe('1');
      expect(result[0].json.parsedAbi).toEqual([{"type":"constructor","inputs":[]}]);
    });

    it('should handle API error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getContractABI';
        if (param === 'address') return 'invalid-address';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        executeContractsOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('API Error');
    });
  });

  describe('getSourceCode', () => {
    it('should get source code successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            SourceCode: 'contract Test {}',
            ABI: '[{"type":"constructor"}]',
            ContractName: 'Test',
            CompilerVersion: 'v0.8.0+commit.c7dfd78e',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getSourceCode';
        if (param === 'address') return '0x1234567890123456789012345678901234567890';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.status).toBe('1');
      expect(result[0].json.result[0].ContractName).toBe('Test');
    });
  });

  describe('verifyContract', () => {
    it('should verify contract successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: 'abc123def456',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'operation') return 'verifyContract';
        if (param === 'address') return '0x1234567890123456789012345678901234567890';
        if (param === 'sourceCode') return 'contract Test {}';
        if (param === 'contractname') return 'Test';
        if (param === 'compilerversion') return 'v0.8.0+commit.c7dfd78e';
        if (param === 'optimizationUsed') return '0';
        if (param === 'runs') return defaultValue || 200;
        if (param === 'constructorArguements') return defaultValue || '';
        if (param === 'evmversion') return defaultValue || '';
        if (param === 'licenseType') return defaultValue || '1';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.status).toBe('1');
      expect(result[0].json.result).toBe('abc123def456');
    });
  });

  describe('checkVerificationStatus', () => {
    it('should check verification status successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: 'Pass - Verified',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'checkVerificationStatus';
        if (param === 'guid') return 'abc123def456';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.status).toBe('1');
      expect(result[0].json.result).toBe('Pass - Verified');
    });
  });

  describe('getContractCreation', () => {
    it('should get contract creation successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            contractAddress: '0x1234567890123456789012345678901234567890',
            contractCreator: '0x0987654321098765432109876543210987654321',
            txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getContractCreation';
        if (param === 'contractaddresses') return '0x1234567890123456789012345678901234567890';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.status).toBe('1');
      expect(result[0].json.result[0].contractAddress).toBe('0x1234567890123456789012345678901234567890');
    });
  });
});

describe('Blocks Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.basescan.org/api',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getLatestBlockNumber', () => {
    it('should get latest block number successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getLatestBlockNumber';
        return undefined;
      });

      const mockResponse = {
        status: '1',
        message: 'OK',
        result: '0x10fb78c',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.basescan.org/api',
        qs: {
          module: 'proxy',
          action: 'eth_blockNumber',
          apikey: 'test-api-key',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getLatestBlockNumber';
        return undefined;
      });

      const mockErrorResponse = {
        status: '0',
        message: 'NOTOK',
        result: 'Error message',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

      await expect(
        executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });
  });

  describe('getBlockByNumber', () => {
    it('should get block by number successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index?: number) => {
        if (param === 'operation') return 'getBlockByNumber';
        if (param === 'tag') return '0x10fb78c';
        if (param === 'boolean') return true;
        return undefined;
      });

      const mockResponse = {
        status: '1',
        message: 'OK',
        result: {
          number: '0x10fb78c',
          hash: '0xabc123...',
          transactions: [],
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.basescan.org/api',
        qs: {
          module: 'proxy',
          action: 'eth_getBlockByNumber',
          tag: '0x10fb78c',
          boolean: 'true',
          apikey: 'test-api-key',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getBlockReward', () => {
    it('should get block reward successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index?: number) => {
        if (param === 'operation') return 'getBlockReward';
        if (param === 'blockno') return '2165403';
        return undefined;
      });

      const mockResponse = {
        status: '1',
        message: 'OK',
        result: {
          blockNumber: '2165403',
          timeStamp: '1472533979',
          blockMiner: '0x13a06d3dfe21e0db5c016c03ea7d2509f7f8d1e3',
          blockReward: '5314181600000000000',
          uncles: [],
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.basescan.org/api',
        qs: {
          module: 'block',
          action: 'getblockreward',
          blockno: '2165403',
          apikey: 'test-api-key',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getBlockCountdown', () => {
    it('should get block countdown successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index?: number) => {
        if (param === 'operation') return 'getBlockCountdown';
        if (param === 'blockno') return '16701588';
        return undefined;
      });

      const mockResponse = {
        status: '1',
        message: 'OK',
        result: {
          CurrentBlock: '16701581',
          CountdownBlock: '16701588',
          RemainingBlock: '7',
          EstimateTimeInSec: '84.84',
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.basescan.org/api',
        qs: {
          module: 'block',
          action: 'getblockcountdown',
          blockno: '16701588',
          apikey: 'test-api-key',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getBlockTransactionCount', () => {
    it('should get block transaction count successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index?: number) => {
        if (param === 'operation') return 'getBlockTransactionCount';
        if (param === 'tag') return 'latest';
        return undefined;
      });

      const mockResponse = {
        status: '1',
        message: 'OK',
        result: '0xa',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.basescan.org/api',
        qs: {
          module: 'proxy',
          action: 'eth_getBlockTransactionCountByNumber',
          tag: 'latest',
          apikey: 'test-api-key',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  it('should handle unknown operation error', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'unknownOperation';
      return undefined;
    });

    await expect(
      executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });

  it('should continue on fail when enabled', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getLatestBlockNumber';
      return undefined;
    });

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
  });
});

describe('Stats Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.basescan.org/api',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getTotalSupply', () => {
    it('should get token total supply successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTotalSupply';
        if (param === 'contractAddress') return '0x1234567890123456789012345678901234567890';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        status: '1',
        result: '1000000000000000000000000',
      });

      const result = await executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.contractAddress).toBe('0x1234567890123456789012345678901234567890');
      expect(result[0].json.totalSupply).toBe('1000000000000000000000000');
    });

    it('should handle invalid contract address format', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTotalSupply';
        if (param === 'contractAddress') return 'invalid-address';
        return '';
      });

      await expect(executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Contract address must be in hex format');
    });
  });

  describe('getGasOracle', () => {
    it('should get gas oracle successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getGasOracle');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        status: '1',
        result: {
          SafeGasPrice: '10',
          ProposeGasPrice: '15',
          FastGasPrice: '20',
        },
      });

      const result = await executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.gasOracle).toBeDefined();
      expect(result[0].json.gasOracle.SafeGasPrice).toBe('10');
    });
  });

  describe('getETHSupply', () => {
    it('should get ETH supply successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getETHSupply');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        status: '1',
        result: '120000000000000000000000000',
      });

      const result = await executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.ethSupply).toBe('120000000000000000000000000');
      expect(result[0].json.ethSupplyFormatted).toBeDefined();
    });
  });

  describe('getETHPrice', () => {
    it('should get ETH price successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getETHPrice');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        status: '1',
        result: {
          ethbtc: '0.06',
          ethusd: '2500',
        },
      });

      const result = await executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.ethPrice).toBeDefined();
      expect(result[0].json.ethPrice.ethusd).toBe('2500');
    });
  });

  describe('getCurrentGasPrice', () => {
    it('should get current gas price successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getCurrentGasPrice');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        result: '0x2540be400',
      });

      const result = await executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.gasPriceHex).toBe('0x2540be400');
      expect(result[0].json.gasPriceGwei).toBeDefined();
    });

    it('should handle API error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getCurrentGasPrice');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        error: {
          message: 'Rate limit exceeded',
        },
      });

      await expect(executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error: Rate limit exceeded');
    });
  });
});

describe('Logs Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.basescan.org/api',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getLogs operation', () => {
    it('should get event logs successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            address: '0x1234567890abcdef1234567890abcdef12345678',
            topics: ['0xabcdef...'],
            data: '0x123...',
            blockNumber: '0x1b4',
            transactionHash: '0xabc123...',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
        switch (paramName) {
          case 'operation': return 'getLogs';
          case 'fromBlock': return '0x1b4';
          case 'toBlock': return 'latest';
          case 'address': return '0x1234567890abcdef1234567890abcdef12345678';
          case 'topic0': return '0xabcdef...';
          case 'topic1': return '';
          case 'topic2': return '';
          case 'topic3': return '';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeLogsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.basescan.org/api',
        qs: {
          module: 'logs',
          action: 'getLogs',
          apikey: 'test-api-key',
          fromBlock: '0x1b4',
          toBlock: 'latest',
          address: '0x1234567890abcdef1234567890abcdef12345678',
          topic0: '0xabcdef...',
        },
        json: true,
      });
    });

    it('should handle API errors', async () => {
      const mockError = {
        status: '0',
        message: 'Invalid address',
        result: null,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getLogs';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockError);

      await expect(executeLogsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error: Invalid address');
    });
  });

  describe('getFilteredLogs operation', () => {
    it('should get filtered logs successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            address: '0x1234567890abcdef1234567890abcdef12345678',
            topics: ['0xabcdef...'],
            data: '0x123...',
            blockNumber: '0x1b4',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getFilteredLogs';
          case 'fromBlock': return '0x1b4';
          case 'toBlock': return 'latest';
          case 'address': return '0x1234567890abcdef1234567890abcdef12345678';
          case 'topics': return '["0xabcdef..."]';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeLogsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should handle invalid topics JSON', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getFilteredLogs';
          case 'topics': return 'invalid json';
          default: return '';
        }
      });

      await expect(executeLogsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Topics must be valid JSON array');
    });
  });

  describe('getMinedBlocks operation', () => {
    it('should get mined blocks successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            blockNumber: '3462296',
            timeStamp: '1491118514',
            blockReward: '5194770940000000000',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getMinedBlocks';
          case 'address': return '0x9dd134d14d1e65f84b706d6f205cd5b1cd03a46b';
          case 'blocktype': return 'blocks';
          case 'page': return 1;
          case 'offset': return 10;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeLogsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.basescan.org/api',
        qs: {
          module: 'account',
          action: 'getminedblocks',
          address: '0x9dd134d14d1e65f84b706d6f205cd5b1cd03a46b',
          blocktype: 'blocks',
          page: '1',
          offset: '10',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });
  });

  it('should handle unknown operations', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

    await expect(executeLogsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Unknown operation: unknownOperation');
  });

  it('should continue on fail when configured', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

    const result = await executeLogsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toContain('Unknown operation: unknownOperation');
  });
});
});
