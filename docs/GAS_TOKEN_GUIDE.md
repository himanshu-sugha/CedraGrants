# Custom Gas Token Integration Guide

This document explains how CedraGrants can leverage Cedra's unique Custom Gas Token feature for improved user experience.

## Overview

From [Cedra Gas Tokens Documentation](https://docs.cedra.network/gas-tokens):

> Custom Gas Tokens transform how users interact with the Cedra blockchain by enabling transaction fee payments in any whitelisted token. This groundbreaking feature eliminates the barrier of needing native CED tokens.

## Why Custom Gas Tokens for CedraGrants?

### Problem
- New users need to acquire CED tokens before contributing to projects
- This creates friction in the onboarding process
- Users may have stablecoins but no native tokens

### Solution
- Allow users to pay gas fees in USDC, USDT, or a custom "GRANTS" token
- Zero native token requirement for contributions
- Simplified UX for mainstream adoption

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  Traditional Flow                                           │
│  ─────────────────                                          │
│  1. User acquires CED tokens                                │
│  2. User holds both CED (for gas) AND contribution tokens   │
│  3. User pays gas in CED                                    │
│  4. User contributes to project                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Custom Gas Token Flow                                      │
│  ──────────────────────                                     │
│  1. User only needs USDC (or whitelisted token)             │
│  2. User pays gas in USDC                                   │
│  3. User contributes in USDC                                │
│  4. Zero CED required!                                      │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Token Creation

Create a GRANTS token using Cedra's fungible asset framework:

```move
module cedra_grants::grants_token {
    use cedra_framework::fungible_asset;
    use cedra_framework::primary_fungible_store;
    
    /// Initialize the GRANTS token
    fun init_module(admin: &signer) {
        // Create the token with:
        // - Name: "CedraGrants"
        // - Symbol: "GRANTS"
        // - Decimals: 8
    }
}
```

### Phase 2: Gas Permission

Configure the token for gas payments:

```move
// Allow network to use GRANTS for gas
fungible_asset::set_gas_payment_allowed(
    &admin,
    grants_metadata,
    true
);
```

### Phase 3: Whitelist Request

- Submit to Cedra governance for mainnet whitelist
- On testnet, admin can whitelist directly

### Phase 4: Frontend Integration

Update transaction building to use custom gas:

```typescript
import { parseTypeTag } from "@cedra-labs/ts-sdk";

const transaction = await client.transaction.build.simple({
    sender: user.accountAddress,
    data: {
        function: "cedra_grants::quadratic_funding::contribute",
        functionArguments: [roundId, projectAddress, amount],
    },
    options: {
        maxGasAmount: 5000,
        // Pay gas in GRANTS token instead of CED!
        faAddress: parseTypeTag("cedra_grants::grants_token::GRANTS"),
    },
});
```

## Benefits Summary

| Feature | Without Custom Gas | With Custom Gas |
|---------|-------------------|-----------------|
| Token types needed | 2 (CED + contribution) | 1 (contribution only) |
| Onboarding steps | Multiple faucet/swap | Single |
| User friction | High | Low |
| Mainstream ready | No | Yes |

## Current Status

- [ ] GRANTS token creation
- [ ] Gas permission configuration
- [ ] Testnet whitelist
- [ ] Frontend integration
- [ ] Mainnet governance proposal

## Resources

- [Custom Gas Tokens](https://docs.cedra.network/gas-tokens)
- [Create Gas Token Guide](https://docs.cedra.network/gas-tokens/custom-gas-tokens)
- [Governance Process](https://docs.cedra.network/gas-tokens/governance)

---

*This feature is planned for future implementation to enhance CedraGrants UX.*
