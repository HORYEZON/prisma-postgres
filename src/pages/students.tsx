import GenericCrudPage from "@/components/GenericCrudPage";

export default function StudentsPage() {
return (
    <GenericCrudPage
        title="Students"
        entity="student"
        fields={[
        { key: "name", label: "Name", type: "text" },
        { key: "email", label: "Email", type: "text" },
        { key: "age", label: "Age", type: "number" },
        { key: "course", label: "Course", type: "text" },
        { key: "status", label: "Status", type: "select", options: ["ACTIVE", "GRADUATED", "DROPPED"] },
        { key: "isEnroll", label: "Enrolled", type: "checkbox" },
        { key: "departmentId", label: "Department ID", type: "number" },
        { key: "professorId", label: "Professor ID", type: "number" },
    ]}
    />
    );
}
