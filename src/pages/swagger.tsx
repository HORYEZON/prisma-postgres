import SwaggerUi from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export default function SwaggerPage() {
    return <SwaggerUi url="/api/docs" />
}
