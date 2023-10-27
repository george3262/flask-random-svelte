<script>
        export let xmlString; // Prop to pass XML string to the component
    
        // Function to convert XML to HTML
        function convertXMLToHTML(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
        const xmlToHTML = (xmlNode) => {
            let html = '';
            if (xmlNode.nodeType === 1) { // Element node
            html += `<${xmlNode.nodeName}>`;
            for (let i = 0; i < xmlNode.childNodes.length; i++) {
                html += xmlToHTML(xmlNode.childNodes[i]);
            }
            html += `</${xmlNode.nodeName}>`;
            } else if (xmlNode.nodeType === 3) { // Text node
            html += xmlNode.textContent;
            }
            return html;
        };
    
        return xmlToHTML(xmlDoc.documentElement);
        }
    
        let htmlContent = convertXMLToHTML(xmlString);
    </script>
    
    <!-- Render the HTML content -->
    <div>{@html htmlContent}</div>
    