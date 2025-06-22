function getData() {
    const data = {
        name: "",
        email: '',
        address: {
            country: '',
            city: '',
        },
        available_date: null,
        willing_to_relocate: false,
        skills: [],
        experience: [],
    };
    for (let i = 0; i < 3; i++) {
        const level = ['Beginner', 'Intermediate', 'Advanced', 'Expert'].sort(() => Math.random() - 0.5)[0];
        data.skills.push({ name: `Skill ${i + 1}`, level });
    }
    for (let i = 0; i < 2; i++) {
        const level = ['Beginner', 'Intermediate', 'Advanced', 'Expert'].sort(() => Math.random() - 0.5)[0];
        data.experience.push({
            company: `Company ${i + 1}`,
            position: `Job title ${i + 1}`,
            start: new Date(`202${5 - i}-01-01`),
            end: i === 0 ? null : new Date(`202${5 - 1}-12-31`),
            current: i === 0
        });
    }
    return data;
}
const rules = {
    name: 'required',
    email: 'required|email',
    'salary.min': 'number',
    'salary.max': 'number|gt:@salary.min',
    'available_date': 'required|date:yy-mm-dd|date_after:' + (new Date().toISOString().split('T')[0]),
    'address.city': 'required',
    'address.country': 'required',
    'linkedin_profile': 'required|url',
    'personal_site': 'url',
    'skills.*.name': 'required',
    'skills.*.level': 'required',
    'experience.*.company': 'required',
    'experience.*.position': 'required',
    'experience.*.start': 'required|date:yy-mm-dd',
    'experience.*.end': 'required_when:@experience.*.current,false|date:yy-mm-dd',
};
const messages = {
    'name:required': 'You gotta have a name',
    'salary.max:gt': 'The max should be greater than the min'
};
const submitHandler = (formData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            alert('Data sent to server: ' + JSON.stringify(formData));
            resolve(true);
        }, 2000);
    });
};
export default function () {
    return {
        data: getData(),
        rules: { ...rules },
        messages: { ...messages },
        submitHandler
    };
}
//# sourceMappingURL=useFormConfig.js.map