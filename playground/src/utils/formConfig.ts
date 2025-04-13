const data = {
  name: '',
  email: '',
  address: {
    country: null,
    city: null,
  },
  willing_to_relocate: false,
  skills: [],
  experience: [],
}
for (let i = 0; i < 5; i++) {
  let level = ['Beginner', 'Intermediate', 'Advanced', 'Expert'].sort(() => Math.random() - 0.5)[0]
  data.skills.push({ name: `Skill ${i}`, level })
}

const rules = {
  name: 'required',
  email: 'required|email',
  'salary.min': 'number',
  'salary.max': 'number',
  'start_date': 'required|date|date_after:' + (new Date().toISOString().split('T')[0]),
  'address.city': 'required',
  'address.country': 'required',
  'linkedin_profile': 'required|url',
  'personal_site': 'url',
  'skills.*.name': 'required',
  'skills.*.level': 'required',
  'experience.*.company': 'required',
  'experience.*.position': 'required',
  'experience.*.start': 'required|date',
  'experience.*.end': 'required_unless:@experience.*.current,false|date',

}

const messages = {
  'name.required': 'You gotta have a name'
}

const submitHandler = async (formData) => {
  return new Promise((resolve) => {
    console.log(formData)
    setTimeout(resolve, 2000)
  })
}
export default {
  data: {...data},
  rules: {...rules},
  messages: {...messages},
  submitHandler
}