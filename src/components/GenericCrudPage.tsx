import { useEffect, useState, useRef } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import SidebarLayout from "@/components/SidebarLayout";

type FieldConfig = {
    key: string;
    label: string;
    type: "text" | "number" | "select" | "checkbox";
    options?: string[]; // for select
};

type Props = {
    title: string;
    entity: string;
    fields: FieldConfig[];
};

export default function GenericCrudPage({ title, entity, fields }: Props) {
    const [records, setRecords] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>({});
    const firstInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchRecords();
    }, []);

    useEffect(() => {
        if (showModal) {
            firstInputRef.current?.focus();
        }
    }, [showModal]);

    const fetchRecords = async () => {
        const res = await fetch(`/api/${entity}`);
        const data = await res.json();
        setRecords(data);
    };

    const handleSave = async () => {
        const url = `/api/${entity}`;
        const method = editingRecord.id ? "PUT" : "POST";

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingRecord),
        });

        handleCloseModal();
        fetchRecords();
    };

    const handleDelete = async (id: number) => {
        if (confirm(`Are you sure you want to delete this ${entity}?`)) {
            await fetch(`/api/${entity}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            fetchRecords();
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRecord({});
    };

    return (
        <SidebarLayout>
            <div className="container mt-4">
                <h2>{title}</h2>
                <Button onClick={() => { setEditingRecord({}); setShowModal(true); }}>
                    Add {title.slice(0, -1)}
                </Button>

                <Table striped bordered hover className="mt-3">
                    <thead>
                        <tr>
                            {fields.map(f => (
                                <th key={f.key}>{f.label}</th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(rec => (
                            <tr key={rec.id}>
                                {fields.map(f => (
                                    <td key={f.key}>
                                        {f.type === "checkbox" ? (rec[f.key] ? "Yes" : "No") : rec[f.key]}
                                    </td>
                                ))}
                                <td>
                                    <Button size="sm" onClick={() => { setEditingRecord(rec); setShowModal(true); }}>
                                        Edit
                                    </Button>{" "}
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(rec.id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {editingRecord.id ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            {fields.map((f, index) => (
                                <Form.Group className="mb-2" key={f.key}>
                                    <Form.Label>{f.label}</Form.Label>
                                    {f.type === "text" && (
                                        <Form.Control
                                            ref={index === 0 ? firstInputRef : null}
                                            value={editingRecord[f.key] ?? ""}
                                            onChange={(e) => setEditingRecord({ ...editingRecord, [f.key]: e.target.value })}
                                        />
                                    )}
                                    {f.type === "number" && (
                                        <Form.Control
                                            type="number"
                                            value={editingRecord[f.key] ?? ""}
                                            onChange={(e) => setEditingRecord({ ...editingRecord, [f.key]: parseInt(e.target.value) || 0 })}
                                        />
                                    )}
                                    {f.type === "select" && (
                                        <Form.Select
                                            value={editingRecord[f.key] ?? f.options?.[0]}
                                            onChange={(e) => setEditingRecord({ ...editingRecord, [f.key]: e.target.value })}
                                        >
                                            {f.options?.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </Form.Select>
                                    )}
                                    {f.type === "checkbox" && (
                                        <Form.Check
                                            type="checkbox"
                                            label={f.label}
                                            checked={editingRecord[f.key] ?? false}
                                            onChange={(e) => setEditingRecord({ ...editingRecord, [f.key]: e.target.checked })}
                                        />
                                    )}
                                </Form.Group>
                            ))}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </SidebarLayout>
    );
}
