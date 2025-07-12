import GenericCrudPage from "@/components/GenericCrudPage";

export default function StudentsPage() {
return (
    <GenericCrudPage
    title="Professors"
    entity="professor"
    fields={[
        { key: "name", label: "Name", type: "text" },
        { key: "email", label: "Email", type: "text" },
        { key: "degree", label: "Degree", type: "select", options: ["Bachelor", "Masteral", "Doctoral"] },
        { key: "departmentId", label: "Department ID", type: "number" },
    ]}
    />
    );
}
