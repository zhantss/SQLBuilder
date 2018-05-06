export default function (event) {
    const disabledElements = ['input', 'textarea', 'select', 'option', 'button', 'i'];
    const disabledAttribute = 'data-canelhoc';

    if (disabledElements.indexOf(event.target.tagName.toLowerCase()) !== -1) {
        return true;
    }

    if(event.currentTarget && ('true' == event.currentTarget.getAttribute(disabledAttribute) || true == event.currentTarget.getAttribute(disabledAttribute))) {
        return true;
    }
}