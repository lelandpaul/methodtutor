
export async function get(url){
    const response = await fetch('./api/' + url);
    const text = await response.json();
    if (response.ok) {
        return text;
    } else {
        throw new Error(text);
    }
}

/* Record results */
export async function post(url, data){
    const response = await fetch('./api/' + url,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const json = await response.json();
    if (response.ok){
        return json;
    } else {
        throw new Error(json);
    }
}

/* Delete records */
export async function httpDel(url, data){
    const response = await fetch('./api/' + url,{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
}
