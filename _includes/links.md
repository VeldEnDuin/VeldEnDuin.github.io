{% for link in site.data.links %}
    {% assign code = link[0] %}
    {% for lang in link[1] %}
        {% assign ln = lang[0] %}
[{{code}}.{{ln}}]: {{lang[1]}}
    {% endfor %}
{% endfor %}