import { dest, src } from 'gulp'

function copyEmailTemplates() {
    return src(['src/iam/emails/*.hbs']).pipe(dest('dist/iam/emails'))
}

exports.default = copyEmailTemplates
