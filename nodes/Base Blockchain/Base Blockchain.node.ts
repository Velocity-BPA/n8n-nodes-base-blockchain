/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-baseblockchain/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class BaseBlockchain implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Base Blockchain',
    name: 'baseblockchain',
    icon: 'file:baseblockchain.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Base Blockchain API',
    defaults: {
      name: 'Base Blockchain',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'baseblockchainApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Accounts',
            value: 'accounts',
          },
          {
            name: 'Transactions',
            value: 'transactions',
          },
          {
            name: 'Tokens',
            value: 'tokens',
          },
          {
            name: 'Contracts',
            value: 'contracts',
          },
          {
            name: 'Blocks',
            value: 'blocks',
          },
          {
            name: 'Stats',
            value: 'stats',
          },
          {
            name: 'Logs',
            value: 'logs',
          }
        ],
        default: 'accounts',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
    },
  },
  options: [
    {
      name: 'Get Balance',
      value: 'getBalance',
      description: 'Get ETH balance for a single address',
      action: 'Get ETH balance for single address',
    },
    {
      name: 'Get Multiple Balances',
      value: 'getMultipleBalances',
      description: 'Get ETH balance for multiple addresses',
      action: 'Get ETH balance for multiple addresses',
    },
    {
      name: 'Get Transactions',
      value: 'getTransactions',
      description: 'Get list of normal transactions',
      action: 'Get list of normal transactions',
    },
    {
      name: 'Get Internal Transactions',
      value: 'getInternalTransactions',
      description: 'Get list of internal transactions',
      action: 'Get list of internal transactions',
    },
    {
      name: 'Get Token Transactions',
      value: 'getTokenTransactions',
      description: 'Get ERC20 token transfer events',
      action: 'Get ERC20 token transfer events',
    },
  ],
  default: 'getBalance',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
    },
  },
  options: [
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get transaction information by hash',
      action: 'Get transaction information',
    },
    {
      name: 'Get Transaction Receipt',
      value: 'getTransactionReceipt',
      description: 'Get transaction receipt by hash',
      action: 'Get transaction receipt',
    },
    {
      name: 'Get Transaction Status',
      value: 'getTransactionStatus',
      description: 'Get transaction receipt status',
      action: 'Get transaction status',
    },
    {
      name: 'Get Transaction Count',
      value: 'getTransactionCount',
      description: 'Get number of transactions sent from address',
      action: 'Get transaction count',
    },
    {
      name: 'Send Raw Transaction',
      value: 'sendRawTransaction',
      description: 'Submit pre-signed transaction',
      action: 'Send raw transaction',
    },
  ],
  default: 'getTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['tokens'],
    },
  },
  options: [
    {
      name: 'Get Token Balance',
      value: 'getTokenBalance',
      description: 'Get ERC20 token balance for address',
      action: 'Get token balance',
    },
    {
      name: 'Get NFT Transactions',
      value: 'getNFTTransactions',
      description: 'Get ERC721 token transfer events',
      action: 'Get NFT transactions',
    },
    {
      name: 'Get Token Info',
      value: 'getTokenInfo',
      description: 'Get ERC20 token information',
      action: 'Get token info',
    },
    {
      name: 'Get Address Token Balance',
      value: 'getAddressTokenBalance',
      description: 'Get token balance for specific contract',
      action: 'Get address token balance',
    },
    {
      name: 'Get Token Holders',
      value: 'getTokenHolders',
      description: 'Get list of token holders',
      action: 'Get token holders',
    },
  ],
  default: 'getTokenBalance',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
    },
  },
  options: [
    {
      name: 'Get Contract ABI',
      value: 'getContractABI',
      description: 'Get contract ABI for verified contract',
      action: 'Get contract ABI',
    },
    {
      name: 'Get Source Code',
      value: 'getSourceCode',
      description: 'Get contract source code',
      action: 'Get source code',
    },
    {
      name: 'Verify Contract',
      value: 'verifyContract',
      description: 'Verify and publish contract source code',
      action: 'Verify contract',
    },
    {
      name: 'Check Verification Status',
      value: 'checkVerificationStatus',
      description: 'Check contract verification status',
      action: 'Check verification status',
    },
    {
      name: 'Get Contract Creation',
      value: 'getContractCreation',
      description: 'Get contract creation transaction',
      action: 'Get contract creation',
    },
  ],
  default: 'getContractABI',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
    },
  },
  options: [
    {
      name: 'Get Latest Block Number',
      value: 'getLatestBlockNumber',
      description: 'Get the latest block number',
      action: 'Get latest block number',
    },
    {
      name: 'Get Block By Number',
      value: 'getBlockByNumber',
      description: 'Get block information by number',
      action: 'Get block by number',
    },
    {
      name: 'Get Block Reward',
      value: 'getBlockReward',
      description: 'Get block and uncle rewards',
      action: 'Get block reward',
    },
    {
      name: 'Get Block Countdown',
      value: 'getBlockCountdown',
      description: 'Get estimated time until target block',
      action: 'Get block countdown',
    },
    {
      name: 'Get Block Transaction Count',
      value: 'getBlockTransactionCount',
      description: 'Get transaction count in block',
      action: 'Get block transaction count',
    },
  ],
  default: 'getLatestBlockNumber',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['stats'],
    },
  },
  options: [
    {
      name: 'Get Total Supply',
      value: 'getTotalSupply',
      description: 'Get total supply of a token',
      action: 'Get total supply of token',
    },
    {
      name: 'Get Gas Oracle',
      value: 'getGasOracle',
      description: 'Get current base gas price',
      action: 'Get current base gas price',
    },
    {
      name: 'Get ETH Supply',
      value: 'getETHSupply',
      description: 'Get total ETH supply on Base',
      action: 'Get total ETH supply on Base',
    },
    {
      name: 'Get ETH Price',
      value: 'getETHPrice',
      description: 'Get ETH price',
      action: 'Get ETH price',
    },
    {
      name: 'Get Current Gas Price',
      value: 'getCurrentGasPrice',
      description: 'Get current gas price',
      action: 'Get current gas price',
    },
  ],
  default: 'getTotalSupply',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['logs'],
    },
  },
  options: [
    {
      name: 'Get Event Logs',
      value: 'getLogs',
      description: 'Get event logs by address and/or topics',
      action: 'Get event logs',
    },
    {
      name: 'Get Filtered Logs',
      value: 'getFilteredLogs',
      description: 'Get logs matching filter criteria',
      action: 'Get filtered logs',
    },
    {
      name: 'Get Mined Blocks',
      value: 'getMinedBlocks',
      description: 'Get list of blocks mined by address',
      action: 'Get mined blocks',
    },
  ],
  default: 'getLogs',
},
      // Parameter definitions
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getBalance'],
    },
  },
  default: '',
  description: 'The Ethereum wallet address to check balance for (hex format)',
},
{
  displayName: 'Tag',
  name: 'tag',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getBalance'],
    },
  },
  options: [
    {
      name: 'Latest',
      value: 'latest',
    },
    {
      name: 'Earliest',
      value: 'earliest',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
  ],
  default: 'latest',
  description: 'The block parameter to retrieve balance from',
},
{
  displayName: 'Addresses',
  name: 'addresses',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getMultipleBalances'],
    },
  },
  default: '',
  description: 'Comma-separated list of Ethereum wallet addresses (hex format)',
},
{
  displayName: 'Tag',
  name: 'tag',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getMultipleBalances'],
    },
  },
  options: [
    {
      name: 'Latest',
      value: 'latest',
    },
    {
      name: 'Earliest',
      value: 'earliest',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
  ],
  default: 'latest',
  description: 'The block parameter to retrieve balances from',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTransactions'],
    },
  },
  default: '',
  description: 'The Ethereum wallet address to get transactions for (hex format)',
},
{
  displayName: 'Start Block',
  name: 'startblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTransactions'],
    },
  },
  default: 0,
  description: 'Starting block number for transaction search',
},
{
  displayName: 'End Block',
  name: 'endblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTransactions'],
    },
  },
  default: 99999999,
  description: 'Ending block number for transaction search',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTransactions'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTransactions'],
    },
  },
  default: 10,
  description: 'Number of transactions per page (max 10000)',
},
{
  displayName: 'Sort',
  name: 'sort',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTransactions'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'Sort order for transactions',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getInternalTransactions'],
    },
  },
  default: '',
  description: 'The Ethereum wallet address to get internal transactions for (hex format)',
},
{
  displayName: 'Start Block',
  name: 'startblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getInternalTransactions'],
    },
  },
  default: 0,
  description: 'Starting block number for transaction search',
},
{
  displayName: 'End Block',
  name: 'endblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getInternalTransactions'],
    },
  },
  default: 99999999,
  description: 'Ending block number for transaction search',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getInternalTransactions'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getInternalTransactions'],
    },
  },
  default: 10,
  description: 'Number of transactions per page (max 10000)',
},
{
  displayName: 'Sort',
  name: 'sort',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getInternalTransactions'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'Sort order for transactions',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTokenTransactions'],
    },
  },
  default: '',
  description: 'The Ethereum wallet address to get token transactions for (hex format)',
},
{
  displayName: 'Contract Address',
  name: 'contractaddress',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTokenTransactions'],
    },
  },
  default: '',
  description: 'The token contract address to filter by (optional)',
},
{
  displayName: 'Start Block',
  name: 'startblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTokenTransactions'],
    },
  },
  default: 0,
  description: 'Starting block number for transaction search',
},
{
  displayName: 'End Block',
  name: 'endblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTokenTransactions'],
    },
  },
  default: 99999999,
  description: 'Ending block number for transaction search',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTokenTransactions'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTokenTransactions'],
    },
  },
  default: 10,
  description: 'Number of transactions per page (max 10000)',
},
{
  displayName: 'Sort',
  name: 'sort',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getTokenTransactions'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'Sort order for transactions',
},
{
  displayName: 'Transaction Hash',
  name: 'txhash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransaction'],
    },
  },
  default: '',
  description: 'The transaction hash to retrieve information for',
  placeholder: '0x1234...',
},
{
  displayName: 'Transaction Hash',
  name: 'txhash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactionReceipt'],
    },
  },
  default: '',
  description: 'The transaction hash to retrieve receipt for',
  placeholder: '0x1234...',
},
{
  displayName: 'Transaction Hash',
  name: 'txhash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactionStatus'],
    },
  },
  default: '',
  description: 'The transaction hash to retrieve status for',
  placeholder: '0x1234...',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactionCount'],
    },
  },
  default: '',
  description: 'The address to get transaction count for (hex format)',
  placeholder: '0x1234...',
},
{
  displayName: 'Tag',
  name: 'tag',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactionCount'],
    },
  },
  options: [
    {
      name: 'Latest',
      value: 'latest',
    },
    {
      name: 'Earliest',
      value: 'earliest',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
  ],
  default: 'latest',
  description: 'The block parameter to use',
},
{
  displayName: 'Raw Transaction Hex',
  name: 'hex',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['sendRawTransaction'],
    },
  },
  default: '',
  description: 'The signed transaction data as hex string',
  placeholder: '0x...',
},
{
  displayName: 'Contract Address',
  name: 'contractaddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getTokenBalance', 'getTokenInfo', 'getAddressTokenBalance', 'getTokenHolders'],
    },
  },
  default: '',
  description: 'The contract address of the ERC20 token',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getTokenBalance', 'getNFTTransactions', 'getAddressTokenBalance'],
    },
  },
  default: '',
  description: 'The address to check token balance for (in hex format)',
},
{
  displayName: 'Tag',
  name: 'tag',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getTokenBalance'],
    },
  },
  default: 'latest',
  description: 'The block number to check balance at (latest, earliest, or specific block number)',
},
{
  displayName: 'Contract Address',
  name: 'contractaddress',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getNFTTransactions'],
    },
  },
  default: '',
  description: 'The contract address of the ERC721 token (optional)',
},
{
  displayName: 'Start Block',
  name: 'startblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getNFTTransactions'],
    },
  },
  default: 0,
  description: 'The starting block number to fetch transactions from',
},
{
  displayName: 'End Block',
  name: 'endblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getNFTTransactions'],
    },
  },
  default: 99999999,
  description: 'The ending block number to fetch transactions to',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getNFTTransactions', 'getAddressTokenBalance', 'getTokenHolders'],
    },
  },
  default: 1,
  description: 'The page number to fetch (if pagination is supported)',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getNFTTransactions', 'getAddressTokenBalance', 'getTokenHolders'],
    },
  },
  default: 10,
  description: 'The number of transactions to display per page (max 10000)',
},
{
  displayName: 'Sort',
  name: 'sort',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['tokens'],
      operation: ['getNFTTransactions'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'The sorting order for transactions',
},
{
  displayName: 'Contract Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['getContractABI', 'getSourceCode'],
    },
  },
  default: '',
  description: 'The contract address in hex format',
},
{
  displayName: 'Contract Addresses',
  name: 'contractaddresses',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['getContractCreation'],
    },
  },
  default: '',
  description: 'Comma-separated list of contract addresses',
},
{
  displayName: 'Verification GUID',
  name: 'guid',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['checkVerificationStatus'],
    },
  },
  default: '',
  description: 'The GUID returned from contract verification submission',
},
{
  displayName: 'Source Code',
  name: 'sourceCode',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['verifyContract'],
    },
  },
  default: '',
  description: 'The contract source code',
},
{
  displayName: 'Contract Name',
  name: 'contractname',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['verifyContract'],
    },
  },
  default: '',
  description: 'The name of the contract',
},
{
  displayName: 'Compiler Version',
  name: 'compilerversion',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['verifyContract'],
    },
  },
  default: '',
  description: 'The compiler version used (e.g., v0.8.0+commit.c7dfd78e)',
},
{
  displayName: 'Optimization Used',
  name: 'optimizationUsed',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['verifyContract'],
    },
  },
  options: [
    {
      name: 'Yes',
      value: '1',
    },
    {
      name: 'No',
      value: '0',
    },
  ],
  default: '0',
  description: 'Whether optimization was used during compilation',
},
{
  displayName: 'Runs',
  name: 'runs',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['verifyContract'],
      optimizationUsed: ['1'],
    },
  },
  default: 200,
  description: 'Number of optimization runs',
},
{
  displayName: 'Constructor Arguments',
  name: 'constructorArguements',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['verifyContract'],
    },
  },
  default: '',
  description: 'Constructor arguments in ABI hex encoded form',
},
{
  displayName: 'EVM Version',
  name: 'evmversion',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['verifyContract'],
    },
  },
  default: '',
  description: 'EVM version to compile for (e.g., london, berlin)',
},
{
  displayName: 'License Type',
  name: 'licenseType',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['contracts'],
      operation: ['verifyContract'],
    },
  },
  options: [
    {
      name: 'None',
      value: '1',
    },
    {
      name: 'Unlicense',
      value: '2',
    },
    {
      name: 'MIT',
      value: '3',
    },
    {
      name: 'GNU GPLv2',
      value: '4',
    },
    {
      name: 'GNU GPLv3',
      value: '5',
    },
    {
      name: 'GNU LGPLv2.1',
      value: '6',
    },
    {
      name: 'GNU LGPLv3',
      value: '7',
    },
    {
      name: 'BSD-2-Clause',
      value: '8',
    },
    {
      name: 'BSD-3-Clause',
      value: '9',
    },
    {
      name: 'MPL-2.0',
      value: '10',
    },
    {
      name: 'OSL-3.0',
      value: '11',
    },
    {
      name: 'Apache-2.0',
      value: '12',
    },
    {
      name: 'GNU AGPLv3',
      value: '13',
    },
    {
      name: 'BSL 1.1',
      value: '14',
    },
  ],
  default: '1',
  description: 'License type for the contract',
},
{
  displayName: 'Block Number/Tag',
  name: 'tag',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlockByNumber'],
    },
  },
  default: 'latest',
  description: 'Block number in hex (e.g., 0x10FB78C) or "latest", "earliest", "pending"',
},
{
  displayName: 'Return Full Transaction Objects',
  name: 'boolean',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlockByNumber'],
    },
  },
  default: false,
  description: 'Whether to return full transaction objects (true) or just transaction hashes (false)',
},
{
  displayName: 'Block Number',
  name: 'blockno',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlockReward', 'getBlockCountdown'],
    },
  },
  default: '',
  description: 'Block number (integer, not hex)',
},
{
  displayName: 'Block Number/Tag',
  name: 'tag',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlockTransactionCount'],
    },
  },
  default: 'latest',
  description: 'Block number in hex (e.g., 0x10FB78C) or "latest", "earliest", "pending"',
},
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['stats'],
      operation: ['getTotalSupply'],
    },
  },
  default: '',
  description: 'The contract address of the token (hex format)',
  placeholder: '0x...',
},
{
  displayName: 'From Block',
  name: 'fromBlock',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['logs'],
      operation: ['getLogs', 'getFilteredLogs'],
    },
  },
  default: 'latest',
  description: 'The starting block number (hex) or "latest"',
},
{
  displayName: 'To Block',
  name: 'toBlock',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['logs'],
      operation: ['getLogs', 'getFilteredLogs'],
    },
  },
  default: 'latest',
  description: 'The ending block number (hex) or "latest"',
},
{
  displayName: 'Contract Address',
  name: 'address',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['logs'],
      operation: ['getLogs', 'getFilteredLogs'],
    },
  },
  default: '',
  description: 'The contract address to filter logs by',
},
{
  displayName: 'Topic 0',
  name: 'topic0',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['logs'],
      operation: ['getLogs'],
    },
  },
  default: '',
  description: 'The first topic to filter by',
},
{
  displayName: 'Topic 1',
  name: 'topic1',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['logs'],
      operation: ['getLogs'],
    },
  },
  default: '',
  description: 'The second topic to filter by',
},
{
  displayName: 'Topic 2',
  name: 'topic2',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['logs'],
      operation: ['getLogs'],
    },
  },
  default: '',
  description: 'The third topic to filter by',
},
{
  displayName: 'Topic 3',
  name: 'topic3',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['logs'],
      operation: ['getLogs'],
    },
  },
  default: '',
  description: 'The fourth topic to filter by',
},
{
  displayName: 'Topics',
  name: 'topics',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['logs'],
      operation: ['getFilteredLogs'],
    },
  },
  default: '',
  description: 'Array of topics as JSON string (e.g., ["0x1234..."])',
},
{
  displayName: 'Miner Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['logs'],
      operation: ['getMinedBlocks'],
    },
  },
  default: '',
  description: 'The miner address to get blocks for',
},
{
  displayName: 'Block Type',
  name: 'blocktype',
  type: 'options',
  options: [
    {
      name: 'Blocks',
      value: 'blocks',
    },
    {
      name: 'Uncles',
      value: 'uncles',
    },
  ],
  required: false,
  displayOptions: {
    show: {
      resource: ['logs'],
      operation: ['getMinedBlocks'],
    },
  },
  default: 'blocks',
  description: 'The type of blocks to return',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['logs'],
      operation: ['getMinedBlocks'],
    },
  },
  default: 1,
  description: 'The page number for pagination',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['logs'],
      operation: ['getMinedBlocks'],
    },
  },
  default: 10,
  description: 'The number of results per page',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
      case 'transactions':
        return [await executeTransactionsOperations.call(this, items)];
      case 'tokens':
        return [await executeTokensOperations.call(this, items)];
      case 'contracts':
        return [await executeContractsOperations.call(this, items)];
      case 'blocks':
        return [await executeBlocksOperations.call(this, items)];
      case 'stats':
        return [await executeStatsOperations.call(this, items)];
      case 'logs':
        return [await executeLogsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAccountsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('baseblockchainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getBalance': {
          const address = this.getNodeParameter('address', i) as string;
          const tag = this.getNodeParameter('tag', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'account',
              action: 'balance',
              address: address,
              tag: tag,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getMultipleBalances': {
          const addresses = this.getNodeParameter('addresses', i) as string;
          const tag = this.getNodeParameter('tag', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'account',
              action: 'balancemulti',
              address: addresses,
              tag: tag,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const startblock = this.getNodeParameter('startblock', i) as number;
          const endblock = this.getNodeParameter('endblock', i) as number;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const sort = this.getNodeParameter('sort', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'account',
              action: 'txlist',
              address: address,
              startblock: startblock,
              endblock: endblock,
              page: page,
              offset: offset,
              sort: sort,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getInternalTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const startblock = this.getNodeParameter('startblock', i) as number;
          const endblock = this.getNodeParameter('endblock', i) as number;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const sort = this.getNodeParameter('sort', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'account',
              action: 'txlistinternal',
              address: address,
              startblock: startblock,
              endblock: endblock,
              page: page,
              offset: offset,
              sort: sort,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getTokenTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const contractaddress = this.getNodeParameter('contractaddress', i) as string;
          const startblock = this.getNodeParameter('startblock', i) as number;
          const endblock = this.getNodeParameter('endblock', i) as number;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const sort = this.getNodeParameter('sort', i) as string;
          
          const qs: any = {
            module: 'account',
            action: 'tokentx',
            address: address,
            startblock: startblock,
            endblock: endblock,
            page: page,
            offset: offset,
            sort: sort,
            apikey: credentials.apiKey,
          };
          
          if (contractaddress && contractaddress.trim() !== '') {
            qs.contractaddress = contractaddress;
          }
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: qs,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      if (result.status === '0' && result.message && result.message !== 'No transactions found') {
        throw new NodeApiError(this.getNode(), result, {
          message: `Base API Error: ${result.message}`,
          description: result.result || 'Unknown error',
        });
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }
  
  return returnData;
}

async function executeTransactionsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('baseblockchainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getTransaction': {
          const txhash = this.getNodeParameter('txhash', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'proxy',
              action: 'eth_getTransactionByHash',
              txhash: txhash,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          
          if (result.error) {
            throw new NodeApiError(this.getNode(), result.error, { message: result.error.message });
          }
          break;
        }
        
        case 'getTransactionReceipt': {
          const txhash = this.getNodeParameter('txhash', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'proxy',
              action: 'eth_getTransactionReceipt',
              txhash: txhash,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          
          if (result.error) {
            throw new NodeApiError(this.getNode(), result.error, { message: result.error.message });
          }
          break;
        }
        
        case 'getTransactionStatus': {
          const txhash = this.getNodeParameter('txhash', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'transaction',
              action: 'gettxreceiptstatus',
              txhash: txhash,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          
          if (result.status === '0') {
            throw new NodeApiError(this.getNode(), result, { message: result.message || 'Transaction status request failed' });
          }
          break;
        }
        
        case 'getTransactionCount': {
          const address = this.getNodeParameter('address', i) as string;
          const tag = this.getNodeParameter('tag', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'proxy',
              action: 'eth_getTransactionCount',
              address: address,
              tag: tag,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          
          if (result.error) {
            throw new NodeApiError(this.getNode(), result.error, { message: result.error.message });
          }
          break;
        }
        
        case 'sendRawTransaction': {
          const hex = this.getNodeParameter('hex', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'proxy',
              action: 'eth_sendRawTransaction',
              hex: hex,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          
          if (result.error) {
            throw new NodeApiError(this.getNode(), result.error, { message: result.error.message });
          }
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message || 'Unknown error occurred' }, 
          pairedItem: { item: i } 
        });
      } else {
        throw error;
      }
    }
  }
  
  return returnData;
}

async function executeTokensOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('baseblockchainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getTokenBalance': {
          const contractaddress = this.getNodeParameter('contractaddress', i) as string;
          const address = this.getNodeParameter('address', i) as string;
          const tag = this.getNodeParameter('tag', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://api.basescan.org/api'}?module=account&action=tokenbalance&contractaddress=${contractaddress}&address=${address}&tag=${tag}&apikey=${credentials.apiKey}`,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getNFTTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const contractaddress = this.getNodeParameter('contractaddress', i) as string;
          const startblock = this.getNodeParameter('startblock', i) as number;
          const endblock = this.getNodeParameter('endblock', i) as number;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const sort = this.getNodeParameter('sort', i) as string;

          let url = `${credentials.baseUrl || 'https://api.basescan.org/api'}?module=account&action=tokennfttx&address=${address}&startblock=${startblock}&endblock=${endblock}&page=${page}&offset=${offset}&sort=${sort}&apikey=${credentials.apiKey}`;
          
          if (contractaddress) {
            url += `&contractaddress=${contractaddress}`;
          }

          const options: any = {
            method: 'GET',
            url,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTokenInfo': {
          const contractaddress = this.getNodeParameter('contractaddress', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://api.basescan.org/api'}?module=token&action=tokeninfo&contractaddress=${contractaddress}&apikey=${credentials.apiKey}`,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAddressTokenBalance': {
          const address = this.getNodeParameter('address', i) as string;
          const contractaddress = this.getNodeParameter('contractaddress', i) as string;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://api.basescan.org/api'}?module=account&action=addresstokenbalance&address=${address}&contractaddress=${contractaddress}&page=${page}&offset=${offset}&apikey=${credentials.apiKey}`,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTokenHolders': {
          const contractaddress = this.getNodeParameter('contractaddress', i) as string;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://api.basescan.org/api'}?module=token&action=tokenholderlist&contractaddress=${contractaddress}&page=${page}&offset=${offset}&apikey=${credentials.apiKey}`,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      if (result.status === '0' && result.message !== 'No transactions found') {
        throw new NodeApiError(this.getNode(), result, {
          message: result.result || result.message || 'Unknown API error',
        });
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeContractsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('baseblockchainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getContractABI': {
          const address = this.getNodeParameter('address', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'contract',
              action: 'getabi',
              address: address,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          
          if (result.status === '1') {
            result.parsedAbi = JSON.parse(result.result);
          }
          break;
        }

        case 'getSourceCode': {
          const address = this.getNodeParameter('address', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'contract',
              action: 'getsourcecode',
              address: address,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'verifyContract': {
          const address = this.getNodeParameter('address', i) as string;
          const sourceCode = this.getNodeParameter('sourceCode', i) as string;
          const contractname = this.getNodeParameter('contractname', i) as string;
          const compilerversion = this.getNodeParameter('compilerversion', i) as string;
          const optimizationUsed = this.getNodeParameter('optimizationUsed', i) as string;
          const runs = this.getNodeParameter('runs', i, 200) as number;
          const constructorArguements = this.getNodeParameter('constructorArguements', i, '') as string;
          const evmversion = this.getNodeParameter('evmversion', i, '') as string;
          const licenseType = this.getNodeParameter('licenseType', i, '1') as string;

          const formData: any = {
            module: 'contract',
            action: 'verifysourcecode',
            addressHash: address,
            name: contractname,
            compilerVersion: compilerversion,
            optimization: optimizationUsed,
            contractSourceCode: sourceCode,
            apikey: credentials.apiKey,
            licenseType: licenseType,
          };

          if (optimizationUsed === '1') {
            formData.runs = runs.toString();
          }

          if (constructorArguements) {
            formData.constructorArguements = constructorArguements;
          }

          if (evmversion) {
            formData.evmVersion = evmversion;
          }

          const options: any = {
            method: 'POST',
            url: 'https://api.basescan.org/api',
            form: formData,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'checkVerificationStatus': {
          const guid = this.getNodeParameter('guid', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'contract',
              action: 'checkverifystatus',
              guid: guid,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getContractCreation': {
          const contractaddresses = this.getNodeParameter('contractaddresses', i) as string;
          
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'contract',
              action: 'getcontractcreation',
              contractaddresses: contractaddresses,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      if (result.status === '0' && result.message) {
        throw new NodeApiError(this.getNode(), {
          message: result.message,
          description: result.result || 'API request failed',
        });
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeBlocksOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('baseblockchainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getLatestBlockNumber': {
          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'proxy',
              action: 'eth_blockNumber',
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockByNumber': {
          const tag = this.getNodeParameter('tag', i) as string;
          const returnFullTransactions = this.getNodeParameter('boolean', i) as boolean;

          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'proxy',
              action: 'eth_getBlockByNumber',
              tag: tag,
              boolean: returnFullTransactions.toString(),
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockReward': {
          const blockno = this.getNodeParameter('blockno', i) as string;

          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'block',
              action: 'getblockreward',
              blockno: blockno,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockCountdown': {
          const blockno = this.getNodeParameter('blockno', i) as string;

          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'block',
              action: 'getblockcountdown',
              blockno: blockno,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockTransactionCount': {
          const tag = this.getNodeParameter('tag', i) as string;

          const options: any = {
            method: 'GET',
            url: 'https://api.basescan.org/api',
            qs: {
              module: 'proxy',
              action: 'eth_getBlockTransactionCountByNumber',
              tag: tag,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      // Check for API errors
      if (result.status === '0' && result.message && result.message !== 'OK') {
        throw new NodeApiError(this.getNode(), result, {
          message: `Base API Error: ${result.message}`,
          description: result.result || 'Unknown error occurred',
        });
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeStatsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('baseblockchainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getTotalSupply': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          
          if (!contractAddress.startsWith('0x')) {
            throw new NodeOperationError(this.getNode(), 'Contract address must be in hex format (start with 0x)');
          }

          const options: any = {
            method: 'GET',
            url: credentials.baseUrl,
            qs: {
              module: 'stats',
              action: 'tokensupply',
              contractaddress: contractAddress,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.status !== '1') {
            throw new NodeOperationError(this.getNode(), `API Error: ${response.message || 'Unknown error'}`);
          }

          result = {
            contractAddress,
            totalSupply: response.result,
            totalSupplyFormatted: formatFromWei(response.result),
          };
          break;
        }

        case 'getGasOracle': {
          const options: any = {
            method: 'GET',
            url: credentials.baseUrl,
            qs: {
              module: 'gastracker',
              action: 'gasoracle',
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.status !== '1') {
            throw new NodeOperationError(this.getNode(), `API Error: ${response.message || 'Unknown error'}`);
          }

          result = {
            gasOracle: response.result,
          };
          break;
        }

        case 'getETHSupply': {
          const options: any = {
            method: 'GET',
            url: credentials.baseUrl,
            qs: {
              module: 'stats',
              action: 'ethsupply',
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.status !== '1') {
            throw new NodeOperationError(this.getNode(), `API Error: ${response.message || 'Unknown error'}`);
          }

          result = {
            ethSupply: response.result,
            ethSupplyFormatted: formatFromWei(response.result),
          };
          break;
        }

        case 'getETHPrice': {
          const options: any = {
            method: 'GET',
            url: credentials.baseUrl,
            qs: {
              module: 'stats',
              action: 'ethprice',
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.status !== '1') {
            throw new NodeOperationError(this.getNode(), `API Error: ${response.message || 'Unknown error'}`);
          }

          result = {
            ethPrice: response.result,
          };
          break;
        }

        case 'getCurrentGasPrice': {
          const options: any = {
            method: 'GET',
            url: credentials.baseUrl,
            qs: {
              module: 'proxy',
              action: 'eth_gasPrice',
              apikey: credentials.apiKey,
            },
            json: true,
          };
          
          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeOperationError(this.getNode(), `API Error: ${response.error.message || 'Unknown error'}`);
          }

          const gasPrice = response.result;
          const gasPriceGwei = parseInt(gasPrice, 16) / 1e9;

          result = {
            gasPriceHex: gasPrice,
            gasPriceWei: parseInt(gasPrice, 16).toString(),
            gasPriceGwei: gasPriceGwei.toString(),
          };
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

function formatFromWei(weiValue: string): string {
  try {
    const wei = BigInt(weiValue);
    const eth = Number(wei) / 1e18;
    return eth.toFixed(6);
  } catch (error: any) {
    return weiValue;
  }
}

async function executeLogsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('baseblockchainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getLogs': {
          const fromBlock = this.getNodeParameter('fromBlock', i) as string;
          const toBlock = this.getNodeParameter('toBlock', i) as string;
          const address = this.getNodeParameter('address', i) as string;
          const topic0 = this.getNodeParameter('topic0', i) as string;
          const topic1 = this.getNodeParameter('topic1', i) as string;
          const topic2 = this.getNodeParameter('topic2', i) as string;
          const topic3 = this.getNodeParameter('topic3', i) as string;

          const params: any = {
            module: 'logs',
            action: 'getLogs',
            apikey: credentials.apiKey,
          };

          if (fromBlock) params.fromBlock = fromBlock;
          if (toBlock) params.toBlock = toBlock;
          if (address) params.address = address;
          if (topic0) params.topic0 = topic0;
          if (topic1) params.topic1 = topic1;
          if (topic2) params.topic2 = topic2;
          if (topic3) params.topic3 = topic3;

          const options: any = {
            method: 'GET',
            url: credentials.baseUrl || 'https://api.basescan.org/api',
            qs: params,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getFilteredLogs': {
          const fromBlock = this.getNodeParameter('fromBlock', i) as string;
          const toBlock = this.getNodeParameter('toBlock', i) as string;
          const address = this.getNodeParameter('address', i) as string;
          const topicsString = this.getNodeParameter('topics', i) as string;

          const filterParams: any = {};
          if (fromBlock) filterParams.fromBlock = fromBlock;
          if (toBlock) filterParams.toBlock = toBlock;
          if (address) filterParams.address = address;
          if (topicsString) {
            try {
              filterParams.topics = JSON.parse(topicsString);
            } catch (error: any) {
              throw new NodeOperationError(this.getNode(), 'Topics must be valid JSON array');
            }
          }

          const params: any = {
            module: 'proxy',
            action: 'eth_getLogs',
            apikey: credentials.apiKey,
            ...filterParams,
          };

          const options: any = {
            method: 'GET',
            url: credentials.baseUrl || 'https://api.basescan.org/api',
            qs: params,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getMinedBlocks': {
          const address = this.getNodeParameter('address', i) as string;
          const blocktype = this.getNodeParameter('blocktype', i) as string;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const params: any = {
            module: 'account',
            action: 'getminedblocks',
            address: address,
            blocktype: blocktype,
            page: page.toString(),
            offset: offset.toString(),
            apikey: credentials.apiKey,
          };

          const options: any = {
            method: 'GET',
            url: credentials.baseUrl || 'https://api.basescan.org/api',
            qs: params,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      if (result && result.status === '0' && result.message !== 'OK') {
        throw new NodeApiError(this.getNode(), result, {
          message: `API Error: ${result.message}`,
          description: result.result || 'Unknown error from API',
        });
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}
