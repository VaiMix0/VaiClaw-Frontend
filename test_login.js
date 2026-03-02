const email = 'vaimix@gmail.com';
const password = '12345678';

(async () => {
    const login = await fetch('https://vaiclaw.vaimix.com/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:4200'
        },
        body: JSON.stringify({
            email: email, // Using the defined email variable
            password: password // Using the defined password variable
        })
    });

    const loginData = await login.json();
    console.log('Login Response:', loginData);

    if (loginData.access_token) {
        const token = loginData.access_token;

        const integrationsListRes = await fetch('https://vaiclaw.vaimix.com/api/integrations/list', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Origin': 'http://localhost:4200'
            }
        });
        console.log('/api/integrations/list:', await integrationsListRes.text());

        const integrationsRes = await fetch('https://vaiclaw.vaimix.com/api/integrations', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Origin': 'http://localhost:4200'
            }
        });
        console.log('/api/integrations:', await integrationsRes.text());
    }
})().catch(console.error);
