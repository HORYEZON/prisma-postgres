import { ReactNode } from "react";
import Link from "next/link";
import { Container, Row, Col, Nav } from "react-bootstrap";

type Props = {
    children: ReactNode;
    };

export default function SidebarLayout({ children }: Props) {
    return (
        <Container fluid>
        <Row>
            <Col md={2} className="bg-light vh-100 p-3">
            <h5 className="mb-4">My Admin</h5>
            <Nav className="flex-column">
                <Nav.Link as={Link} href="/students">Students</Nav.Link>
                <Nav.Link as={Link} href="/professors">Professors</Nav.Link>
                <Nav.Link as={Link} href="/departments">Departments</Nav.Link>
            </Nav>
            </Col>
            <Col md={10} className="p-4">
            {children}
            </Col>
        </Row>
        </Container>
    );
}
