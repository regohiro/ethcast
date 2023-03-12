import { Action, ActionPanel, Form } from "@raycast/api";
import { useState } from "react";
import BigNumber from "bignumber.js";

BigNumber.config({ DECIMAL_PLACES: 30 });

interface Unit {
  name: string;
  unit: BigNumber; // unit relative to wei
}

const units: Unit[] = [
  {
    name: "wei",
    unit: new BigNumber("1"),
  },
  {
    name: "gwei",
    unit: new BigNumber("1000000000"),
  },
  {
    name: "satoshi",
    unit: new BigNumber("10000000000"),
  },
  {
    name: "micro",
    unit: new BigNumber("1000000000000"),
  },
  {
    name: "ether",
    unit: new BigNumber("1000000000000000000"),
  },
];

export default function Command() {
  const [clipboardValue, setClipboardValue] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  const onFocus = (e: Form.Event<string>) => {
    if (e.target.value) {
      setClipboardValue(e.target.value);
    }
  };

  const onChange = (src: Unit, value: string) => {
    if (isNumeric(value)) {
      const newValues = units.reduce(
        (acc, unit) => ({
          ...acc,
          [unit.name]: convert(src, unit, value),
        }),
        {}
      );
      setValues(newValues);
    } else if (value === "") {
      setValues({});
    } else {
      setValues((values) => ({ ...values, [src.name]: value }));
    }
  };

  const isNumeric = (str: string) => {
    const regex = RegExp(/^[0-9]+\.?[0-9]*$/);
    return regex.test(str);
  };

  const convert = (from: Unit, to: Unit, value: string) => {
    if (from.name === to.name) {
      return value;
    }
    const valueBN = new BigNumber(value);
    const parsedBN = valueBN.times(from.unit).integerValue().div(to.unit);
    return parsedBN.toString(10);
  };

  const etherUnit = units.find((u) => u.name === "ether")!;

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.Paste content={clipboardValue} />
        </ActionPanel>
      }
    >
      {units.map((unit) => (
        <Form.TextField
          id={unit.name}
          key={unit.name}
          title={unit.name.charAt(0).toUpperCase() + unit.name.slice(1)}
          placeholder={convert(etherUnit, unit, "1")}
          value={values[unit.name] || ""}
          onChange={(value) => onChange(unit, value)}
          onFocus={onFocus}
        />
      ))}
    </Form>
  );
}
