import GenericCrudPage from "@/components/GenericCrudPage";

export default function StudentsPage() {
return (
    <GenericCrudPage
    title="Departments"
    entity="department"
    fields={[
        { key: "name", label: "Name", type: "text" },
        { key: "email", label: "Email", type: "text" },
        { key: "year", label: "Year", type: "number" },
    ]}
    />
    );
}
