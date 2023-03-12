import { Action, ActionPanel, Form } from "@raycast/api";
import { useState } from "react";
import BigNumber from "bignumber.js";

const units = ["wei", "gwei", "ether"] as const;
type Unit = (typeof units)[number];

const rawUnits: Record<Unit, string> = {
  wei: "1",
  gwei: "1000000000",
  ether: "1000000000000000000",
};

const defaultValues: Record<Unit, string> = {
  wei: "",
  gwei: "",
  ether: "",
};

export default function Command() {
  BigNumber.config({ DECIMAL_PLACES: 30 });

  const [clipboardValue, setClipboardValue] = useState("");
  const [values, setValues] = useState(defaultValues);

  const onChange = (src: Unit, value: string) => {
    if (isNumeric(value)) {
      const newValues = units.reduce(
        (acc, unit) => ({
          ...acc,
          [unit]: convert(value, src, unit),
        }),
        defaultValues
      );
      setValues(newValues);
    } else if (value === "") {
      setValues(defaultValues);
    } else {
      setValues((values) => ({ ...values, [src]: value }));
    }
  };

  const onFocus = (e: Form.Event<string>) => {
    if (e.target.value) {
      setClipboardValue(e.target.value);
    }
  };

  const isNumeric = (str: string) => {
    const regex = RegExp(/^[0-9]+\.?[0-9]*$/);
    return regex.test(str);
  };

  const convert = (value: string, from: Unit, to: Unit) => {
    if (from == to) {
      return value;
    }
    const fromUnit = new BigNumber(rawUnits[from]);
    const toUnit = new BigNumber(rawUnits[to]);
    const parsed = new BigNumber(value).times(fromUnit).integerValue().div(toUnit);
    return parsed.toString(10);
  };

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
          id={unit}
          key={unit}
          title={unit.charAt(0).toUpperCase() + unit.slice(1)}
          value={values[unit]}
          onChange={(value) => onChange(unit, value)}
          onFocus={onFocus}
        />
      ))}
    </Form>
  );
}
