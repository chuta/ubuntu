import { Select } from "@/components/ui/select";
import {
  regulatorCategoryLabel,
  regulatorOptionLabel,
  type RegulatorOrganizationOption,
} from "@/lib/constants/regulatory";

export function RegulatorSelect({
  regulators,
  id = "regulator_organization_id",
  name = "regulator_organization_id",
  defaultValue = "",
  required,
}: {
  regulators: RegulatorOrganizationOption[];
  id?: string;
  name?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const primary = regulators.filter((r) => r.category === "PRIMARY_DIGITAL_ASSET");
  const supporting = regulators.filter((r) => r.category === "SUPPORTING");

  return (
    <Select id={id} name={name} defaultValue={defaultValue} required={required}>
      <option value="">{required ? "Select regulator" : "None"}</option>
      {primary.length > 0 && (
        <optgroup label={regulatorCategoryLabel("PRIMARY_DIGITAL_ASSET")}>
          {primary.map((r) => (
            <option key={r.id} value={r.id}>
              {regulatorOptionLabel(r)}
            </option>
          ))}
        </optgroup>
      )}
      {supporting.length > 0 && (
        <optgroup label={regulatorCategoryLabel("SUPPORTING")}>
          {supporting.map((r) => (
            <option key={r.id} value={r.id}>
              {regulatorOptionLabel(r)}
            </option>
          ))}
        </optgroup>
      )}
    </Select>
  );
}
