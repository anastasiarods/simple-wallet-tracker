import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { addressAssets, ensName } from "~/web3/ethereum.server";
import invariant from "tiny-invariant";
import {
  Card,
  Title,
  Text,
  Block,
  Metric,
  Icon,
  Flex,
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
} from "@tremor/react";
import { WalletIcon } from "@heroicons/react/24/outline";
import { currencyFormat, totalValue } from "~/utils";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.address, `params.address is required`);

  const assets = await addressAssets(params.address);
  const name = await ensName(params.address);
  return json({ assets, address: params.address, ensName: name });
};

export default function WalletAddress() {
  const { assets, address, ensName } = useLoaderData<typeof loader>();

  return (
    <Block spaceY="space-y-6">
      <Card>
        <Block spaceY="space-y-6">
          <div>
            <Text>Address</Text>
            <Title>{ensName || address}</Title>
          </div>
          <div>
            <Text>Total Balance</Text>
            <Metric>{"$" + currencyFormat(totalValue(assets))}</Metric>
          </div>
        </Block>
      </Card>

      <Card>
        <Flex justifyContent="justify-start" spaceX="space-x-2">
          <Icon size="lg" color="violet" variant="solid" icon={WalletIcon} />
          <Title>{"Wallet $" + currencyFormat(totalValue(assets))}</Title>
        </Flex>

        <Table marginTop="mt-6">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Asset</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Balance</TableHeaderCell>
              <TableHeaderCell>Value</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.tokenID}>
                <TableCell>
                  <Flex justifyContent="justify-start" spaceX="space-x-2">
                    <img
                      className="h-6 w-6 flex-shrink-0 rounded-full"
                      src={asset.tokenInfo?.logoURI}
                    />
                    <Text>{asset.tokenInfo?.name}</Text>
                  </Flex>
                </TableCell>
                <TableCell>{"$" + currencyFormat(asset.price)}</TableCell>
                <TableCell>
                  {currencyFormat(asset.balance) +
                    " " +
                    asset.tokenInfo?.symbol}
                </TableCell>
                <TableCell>
                  {"$" + currencyFormat(asset.balance * asset.price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Block>
  );
}
