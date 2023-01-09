import { Title, Block, TextInput } from "@tremor/react";
import { Outlet, Form, useNavigate } from "@remix-run/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { ethers } from "ethers";

export default function Example() {
  const [address, setAddress] = React.useState("");
  const [error, setError] = React.useState(false);
  const navigate = useNavigate();

  const onSubmit = React.useCallback(
    (evt: React.FormEvent) => {
      evt.preventDefault();
      if (ethers.utils.isAddress(address)) {
        navigate(`/${address}`);
        setAddress("");
      } else {
        setError(true);
      }
    },
    [address, navigate]
  );

  return (
    <div>
      <main className="p-6 sm:p-10 bg-slate-50 min-h-screen flex justify-center">
        <Block spaceY="space-y-6" maxWidth="max-w-6xl">
          <Block>
            <Title>Simple Wallet Analytics</Title>
          </Block>
          <Form onSubmit={onSubmit}>
            <TextInput
              error={error}
              errorMessage="Wrong address format"
              value={address}
              onChange={(event) => {
                setError(false);
                setAddress(event.target.value.toLowerCase());
              }}
              icon={MagnifyingGlassIcon}
              placeholder="Search by wallet..."
            />
          </Form>
          <Outlet />
        </Block>
      </main>
    </div>
  );
}
