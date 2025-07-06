import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css"

// Dynamically import swagger-ui-react with SSR turned off
const SwaggerUi = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function SwaggerPage() {
    return <SwaggerUi url="/api/docs" />
}
