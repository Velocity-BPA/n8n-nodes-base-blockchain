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
          },
          {
            name: 'Block',
            value: 'block',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Account',
            value: 'account',
          },
          {
            name: 'Contract',
            value: 'contract',
          },
          {
            name: 'Token',
            value: 'token',
          },
          {
            name: 'Network',
            value: 'network',
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
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['block'] } },
  options: [
    { name: 'Get Block By Number', value: 'getBlockByNumber', description: 'Get block by number', action: 'Get block by number' },
    { name: 'Get Block By Hash', value: 'getBlockByHash', description: 'Get block by hash', action: 'Get block by hash' },
    { name: 'Get Latest Block', value: 'getLatestBlock', description: 'Get latest block number', action: 'Get latest block' },
    { name: 'Get Block Transaction Count', value: 'getBlockTransactionCount', description: 'Get transaction count in block', action: 'Get block transaction count' }
  ],
  default: 'getBlockByNumber',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['transaction'] } },
  options: [
    { name: 'Get Transaction', value: 'getTransaction', description: 'Get transaction by hash', action: 'Get transaction' },
    { name: 'Get Transaction Receipt', value: 'getTransactionReceipt', description: 'Get transaction receipt', action: 'Get transaction receipt' },
    { name: 'Send Raw Transaction', value: 'sendRawTransaction', description: 'Broadcast signed transaction', action: 'Send raw transaction' },
    { name: 'Estimate Gas', value: 'estimateGas', description: 'Estimate gas for transaction', action: 'Estimate gas' },
    { name: 'Get Transaction Count', value: 'getTransactionCount', description: 'Get account nonce', action: 'Get transaction count' }
  ],
  default: 'getTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['account'] } },
  options: [
    { name: 'Get Balance', value: 'getBalance', description: 'Get ETH balance of account', action: 'Get balance' },
    { name: 'Get Code', value: 'getCode', description: 'Get contract code at address', action: 'Get code' },
    { name: 'Get Storage At', value: 'getStorageAt', description: 'Get storage value at position', action: 'Get storage at' }
  ],
  default: 'getBalance',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['contract'] } },
  options: [
    { name: 'Call', value: 'call', description: 'Execute read-only contract call', action: 'Execute read-only contract call' },
    { name: 'Estimate Gas', value: 'estimateGas', description: 'Estimate gas for contract interaction', action: 'Estimate gas for contract interaction' },
    { name: 'Get Logs', value: 'getLogs', description: 'Get contract event logs', action: 'Get contract event logs' },
    { name: 'Get Code', value: 'getCode', description: 'Get contract bytecode', action: 'Get contract bytecode' }
  ],
  default: 'call',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['token'] } },
  options: [
    { name: 'Get Token Balance', value: 'getBalance', description: 'Get token balance via contract call', action: 'Get token balance' },
    { name: 'Get Token Metadata', value: 'getMetadata', description: 'Get token metadata via contract call', action: 'Get token metadata' },
    { name: 'Get Token Allowance', value: 'getAllowance', description: 'Get token allowance via contract call', action: 'Get token allowance' },
    { name: 'Get Token Transfer Events', value: 'getTransferEvents', description: 'Get token transfer events via logs', action: 'Get token transfer events' }
  ],
  default: 'getBalance',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['network'] } },
  options: [
    { name: 'Get Chain ID', value: 'getChainId', description: 'Get Base chain ID', action: 'Get chain ID' },
    { name: 'Get Gas Price', value: 'getGasPrice', description: 'Get current gas price', action: 'Get gas price' },
    { name: 'Get Fee History', value: 'getFeeHistory', description: 'Get historical gas fees', action: 'Get fee history' },
    { name: 'Get Sync Status', value: 'syncing', description: 'Get sync status', action: 'Get sync status' }
  ],
  default: 'getChainId',
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
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  default: 'latest',
  description: 'Block number in hex, or "latest", "earliest", "pending"',
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByNumber', 'getBlockTransactionCount']
    }
  }
},
{
  displayName: 'Include Transactions',
  name: 'includeTransactions',
  type: 'boolean',
  default: false,
  description: 'Whether to include full transaction objects',
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByNumber']
    }
  }
},
{
  displayName: 'Block Hash',
  name: 'blockHash',
  type: 'string',
  default: '',
  description: 'Block hash to retrieve',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByHash']
    }
  }
},
{
  displayName: 'Include Transactions',
  name: 'includeTransactions',
  type: 'boolean',
  default: false,
  description: 'Whether to include full transaction objects',
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByHash']
    }
  }
},
{
  displayName: 'Transaction Hash',
  name: 'transactionHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransaction']
    }
  },
  default: '',
  description: 'The hash of the transaction to retrieve',
  placeholder: '0x...'
},
{
  displayName: 'Transaction Hash',
  name: 'transactionHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactionReceipt']
    }
  },
  default: '',
  description: 'The hash of the transaction to get receipt for',
  placeholder: '0x...'
},
{
  displayName: 'Signed Transaction Data',
  name: 'signedTransactionData',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['sendRawTransaction']
    }
  },
  default: '',
  description: 'The signed transaction data in hex format',
  placeholder: '0x...'
},
{
  displayName: 'Transaction Object',
  name: 'transactionObject',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['estimateGas']
    }
  },
  default: '{}',
  description: 'Transaction object to estimate gas for (JSON format)',
  placeholder: '{"to": "0x...", "value": "0x0", "data": "0x..."}'
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactionCount']
    }
  },
  default: '',
  description: 'The address to get transaction count for',
  placeholder: '0x...'
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactionCount']
    }
  },
  default: 'latest',
  description: 'Block number or tag (latest, earliest, pending)',
  placeholder: 'latest'
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getBalance', 'getCode', 'getStorageAt']
    }
  },
  default: '',
  placeholder: '0x742e4758d8f3f0e5c6e8e5e5e5e5e5e5e5e5e5e5',
  description: 'The Ethereum address to query'
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getBalance', 'getCode', 'getStorageAt']
    }
  },
  default: 'latest',
  placeholder: 'latest, earliest, pending, or hex block number',
  description: 'Block number as hex, "latest", "earliest", or "pending"'
},
{
  displayName: 'Position',
  name: 'position',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getStorageAt']
    }
  },
  default: '0x0',
  placeholder: '0x0',
  description: 'Storage position as hex value'
},
{
  displayName: 'Transaction Object',
  name: 'transactionObject',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['contract'], operation: ['call'] } },
  default: '{}',
  description: 'Transaction object for the contract call',
  placeholder: '{"to": "0x...", "data": "0x..."}',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: { show: { resource: ['contract'], operation: ['call'] } },
  default: 'latest',
  description: 'Block number as hex, "latest", "earliest", or "pending"',
  placeholder: 'latest',
},
{
  displayName: 'Transaction Object',
  name: 'transactionObject',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['contract'], operation: ['estimateGas'] } },
  default: '{}',
  description: 'Transaction object for gas estimation',
  placeholder: '{"to": "0x...", "data": "0x..."}',
},
{
  displayName: 'Filter Object',
  name: 'filterObject',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['contract'], operation: ['getLogs'] } },
  default: '{}',
  description: 'Filter object for event logs',
  placeholder: '{"address": "0x...", "topics": [...]}',
},
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['contract'], operation: ['getCode'] } },
  default: '',
  description: 'Contract address to get bytecode for',
  placeholder: '0x...',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: { show: { resource: ['contract'], operation: ['getCode'] } },
  default: 'latest',
  description: 'Block number as hex, "latest", "earliest", or "pending"',
  placeholder: 'latest',
},
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['token'], operation: ['getBalance', 'getMetadata', 'getAllowance'] } },
  default: '',
  description: 'The contract address of the token',
},
{
  displayName: 'Method Call',
  name: 'methodCall',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['token'], operation: ['getBalance', 'getMetadata', 'getAllowance'] } },
  default: '',
  description: 'The method call data for the contract',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: { show: { resource: ['token'], operation: ['getBalance', 'getMetadata', 'getAllowance'] } },
  default: 'latest',
  description: 'Block number as hex, "latest", "earliest", or "pending"',
},
{
  displayName: 'Filter Object',
  name: 'filterObject',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['token'], operation: ['getTransferEvents'] } },
  default: '{}',
  description: 'Filter object for log queries',
},
{
  displayName: 'Block Count',
  name: 'blockCount',
  type: 'number',
  required: true,
  displayOptions: { 
    show: { 
      resource: ['network'],
      operation: ['getFeeHistory'] 
    } 
  },
  default: 4,
  description: 'Number of blocks in the requested range',
},
{
  displayName: 'Newest Block',
  name: 'newestBlock',
  type: 'string',
  required: true,
  displayOptions: { 
    show: { 
      resource: ['network'],
      operation: ['getFeeHistory'] 
    } 
  },
  default: 'latest',
  description: 'Highest number block of the requested range (can be "latest", "earliest", "pending", or hex block number)',
},
{
  displayName: 'Reward Percentiles',
  name: 'rewardPercentiles',
  type: 'json',
  required: false,
  displayOptions: { 
    show: { 
      resource: ['network'],
      operation: ['getFeeHistory'] 
    } 
  },
  default: '[25, 50, 75]',
  description: 'Array of percentile values to sample from each block\'s effective priority fees per gas',
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
      case 'block':
        return [await executeBlockOperations.call(this, items)];
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'account':
        return [await executeAccountOperations.call(this, items)];
      case 'contract':
        return [await executeContractOperations.call(this, items)];
      case 'token':
        return [await executeTokenOperations.call(this, items)];
      case 'network':
        return [await executeNetworkOperations.call(this, items)];
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