// translate object, used by in i18next
const objectTranslate = (t, obj)=>{  
    const newObj = {};
    for (const k in obj) {
        const tk = t(k);
        newObj[tk] = obj[k]
    }
    return newObj
}
module.exports = objectTranslate